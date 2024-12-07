import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import log from '@log';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';

function authDirective(
  directiveName: string,
  getUserFn: (token: string) => { authenticated: boolean; roles: string[] },
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
        default
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
            const { resolve = defaultFieldResolver } = fieldConfig;
            fieldConfig.resolve = function (source, args, context, info) {
              log.trace({
                msg: 'Auth directive check',
                context: context,
              });
              const user = getUserFn(context);
              if (
                !user.authenticated ||
                (requires && !user.roles.includes(requires))
              ) {
                throw new Error('not authorized');
              }
              return resolve(source, args, context, info);
            };
            return fieldConfig;
          }
          return undefined;
        },
      }),
  };
}

function getUser(context) {
  const authenticated = context.auth?.sub != null;
  const roles = context.roles.map((role) => role.role.split(':')[1]);
  return {
    authenticated,
    roles,
  };
}

export const { authDirectiveTypeDefs, authDirectiveTransformer } =
  authDirective('auth', getUser);
