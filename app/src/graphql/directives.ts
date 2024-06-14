import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';

function authDirective(
  directiveName: string,
  getUserFn: (token: string) => { hasRole: (role: string) => boolean },
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typeDirectiveArgumentMaps: Record<string, any> = {};
  return {
    authDirectiveTypeDefs: `directive @${directiveName}(
        requires: Role = ADMIN,
      ) on OBJECT | FIELD_DEFINITION
   
      enum Role {
        admin
        member
        unknown
      }`,

    authDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.TYPE]: (type) => {
          const authDirective = getDirective(schema, type, directiveName)?.[0];
          if (authDirective) {
            typeDirectiveArgumentMaps[type.name] = authDirective;
          }
          return undefined;
        },
        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
          const authDirective =
            getDirective(schema, fieldConfig, directiveName)?.[0] ??
            typeDirectiveArgumentMaps[typeName];
          if (authDirective) {
            const { requires } = authDirective;
            if (requires) {
              const { resolve = defaultFieldResolver } = fieldConfig;
              fieldConfig.resolve = function (source, args, context, info) {
                const user = getUserFn(context);
                if (!user.hasRole(requires)) {
                  throw new Error('not authorized');
                }
                return resolve(source, args, context, info);
              };
              return fieldConfig;
            }
          }
          return undefined;
        },
      }),
  };
}

function getUser(context) {
  const roles = context.roles.map((role) => role.role.split(':')[1]);
  return {
    hasRole: (role) => roles.includes(role),
  };
}

export const { authDirectiveTypeDefs, authDirectiveTransformer } =
  authDirective('auth', getUser);
