import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  JSONObject: { input: any; output: any; }
};

export type AddMediaAssetResponse = {
  __typename?: 'AddMediaAssetResponse';
  id: Scalars['String']['output'];
  signedUrl: Scalars['String']['output'];
};

export type Agent = {
  __typename?: 'Agent';
  capabilities: Array<Capability>;
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  logicalCollection: Collection;
  memoryEnabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  outputFilter?: Maybe<Scalars['String']['output']>;
  reasoning?: Maybe<AgentReasoning>;
  subscriptionFilter?: Maybe<Scalars['String']['output']>;
};

export type AgentInput = {
  capabilities: Array<InputMaybe<Scalars['String']['input']>>;
  description: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  logicalCollection: Scalars['String']['input'];
  memoryEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  outputFilter?: InputMaybe<Scalars['String']['input']>;
  reasoning?: InputMaybe<AgentReasoningInput>;
  subscriptionFilter?: InputMaybe<Scalars['String']['input']>;
};

export type AgentReasoning = {
  __typename?: 'AgentReasoning';
  llmModel: Scalars['String']['output'];
  prompt: Scalars['String']['output'];
  variablePassThrough: Scalars['Boolean']['output'];
};

export type AgentReasoningInput = {
  llmModel: Scalars['String']['input'];
  prompt: Scalars['String']['input'];
  variablePassThrough: Scalars['Boolean']['input'];
};

export type AverageInquiryResponseTime = {
  __typename?: 'AverageInquiryResponseTime';
  minutes: Scalars['Float']['output'];
  responseCount: Scalars['Int']['output'];
};

export type Capability = {
  __typename?: 'Capability';
  alias: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  llmModel: Scalars['String']['output'];
  logicalCollection: Collection;
  name: Scalars['String']['output'];
  outputFilter?: Maybe<Scalars['String']['output']>;
  outputMode: Scalars['String']['output'];
  prompts: Array<Prompt>;
  subscriptionFilter?: Maybe<Scalars['String']['output']>;
};

export type CapabilityInput = {
  alias: Scalars['String']['input'];
  description: Scalars['String']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  llmModel?: InputMaybe<Scalars['String']['input']>;
  logicalCollection: Scalars['String']['input'];
  name: Scalars['String']['input'];
  outputFilter?: InputMaybe<Scalars['String']['input']>;
  outputMode?: InputMaybe<Scalars['String']['input']>;
  prompts?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  subscriptionFilter?: InputMaybe<Scalars['String']['input']>;
};

export type Collection = {
  __typename?: 'Collection';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type CollectionInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
};

export type FloatFilter = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
};

export type Inquiry = {
  __typename?: 'Inquiry';
  createdAt: Scalars['Float']['output'];
  data: InquiryData;
  id: Scalars['ID']['output'];
  responses?: Maybe<Array<InquiryResponse>>;
  updatedAt: Scalars['Float']['output'];
  userId?: Maybe<Array<Scalars['ID']['output']>>;
};

export type InquiryData = {
  __typename?: 'InquiryData';
  draftGraph?: Maybe<Scalars['JSONObject']['output']>;
  graph?: Maybe<Scalars['JSONObject']['output']>;
  mcpTools: Array<Scalars['JSONObject']['output']>;
  metadata?: Maybe<Scalars['JSONObject']['output']>;
  settings: InquirySettings;
};

export type InquiryResponse = {
  __typename?: 'InquiryResponse';
  createdAt: Scalars['Float']['output'];
  data: InquiryResponseData;
  id: Scalars['ID']['output'];
  updatedAt: Scalars['Float']['output'];
  userId?: Maybe<Scalars['ID']['output']>;
};

export type InquiryResponseData = {
  __typename?: 'InquiryResponseData';
  history: Array<Scalars['JSONObject']['output']>;
  status: InquiryResponseStatus;
  userDetails?: Maybe<InquiryResponseUserDetails>;
};

export type InquiryResponseFilters = {
  createdAt?: InputMaybe<FloatFilter>;
  email?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
};

export enum InquiryResponseStatus {
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  Pending = 'PENDING'
}

export type InquiryResponseUserDetails = {
  __typename?: 'InquiryResponseUserDetails';
  email?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  recieveEmails?: Maybe<Scalars['Boolean']['output']>;
};

export type InquirySettings = {
  __typename?: 'InquirySettings';
  context?: Maybe<Scalars['String']['output']>;
  goals: Scalars['String']['output'];
  notifications?: Maybe<InquirySettingsNotifications>;
  title: Scalars['String']['output'];
  voice?: Maybe<Scalars['String']['output']>;
};

export type InquirySettingsNotifications = {
  __typename?: 'InquirySettingsNotifications';
  recieveEmailOnResponse?: Maybe<Scalars['Boolean']['output']>;
};

export type Model = {
  __typename?: 'Model';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  region: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addMediaAsset?: Maybe<AddMediaAssetResponse>;
  addPrediction?: Maybe<Scalars['String']['output']>;
  deleteAgent?: Maybe<Agent>;
  deleteCapability?: Maybe<Capability>;
  deleteCollection?: Maybe<Collection>;
  deleteInquiry?: Maybe<Inquiry>;
  deleteInquiryResponse?: Maybe<InquiryResponse>;
  deleteMediaAsset?: Maybe<Scalars['Int']['output']>;
  deletePrompt?: Maybe<Prompt>;
  emailInquiryToUsers?: Maybe<Scalars['String']['output']>;
  generateAudio?: Maybe<Scalars['String']['output']>;
  registerUser: Scalars['Boolean']['output'];
  updateInquiryOwners: Inquiry;
  upsertAgent?: Maybe<Agent>;
  upsertCapability?: Maybe<Capability>;
  upsertCollection?: Maybe<Collection>;
  upsertInquiry: Inquiry;
  upsertInquiryResponse: InquiryResponse;
  upsertPrompt?: Maybe<Prompt>;
};


export type MutationAddPredictionArgs = {
  agentId: Scalars['ID']['input'];
  attachments?: InputMaybe<Array<Scalars['JSONObject']['input']>>;
  subscriptionId: Scalars['ID']['input'];
  variables?: InputMaybe<Scalars['JSONObject']['input']>;
};


export type MutationDeleteAgentArgs = {
  agentId: Scalars['ID']['input'];
};


export type MutationDeleteCapabilityArgs = {
  capabilityId: Scalars['ID']['input'];
};


export type MutationDeleteCollectionArgs = {
  collectionId: Scalars['ID']['input'];
};


export type MutationDeleteInquiryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteInquiryResponseArgs = {
  id: Scalars['ID']['input'];
  inquiryId: Scalars['ID']['input'];
};


export type MutationDeleteMediaAssetArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeletePromptArgs = {
  promptId: Scalars['ID']['input'];
};


export type MutationEmailInquiryToUsersArgs = {
  inquiryId: Scalars['String']['input'];
  userData: Array<UserDataInput>;
};


export type MutationGenerateAudioArgs = {
  text: Scalars['String']['input'];
  voice: Scalars['String']['input'];
};


export type MutationUpdateInquiryOwnersArgs = {
  id: Scalars['ID']['input'];
  owners: Array<Scalars['String']['input']>;
};


export type MutationUpsertAgentArgs = {
  agent: AgentInput;
};


export type MutationUpsertCapabilityArgs = {
  capability: CapabilityInput;
};


export type MutationUpsertCollectionArgs = {
  input: CollectionInput;
};


export type MutationUpsertInquiryArgs = {
  data: Scalars['JSONObject']['input'];
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationUpsertInquiryResponseArgs = {
  data: Scalars['JSONObject']['input'];
  fields?: InputMaybe<Array<Scalars['String']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  inquiryId: Scalars['ID']['input'];
  subscriptionId: Scalars['ID']['input'];
};


export type MutationUpsertPromptArgs = {
  prompt: PromptInput;
};

export type Prediction = {
  __typename?: 'Prediction';
  id: Scalars['ID']['output'];
  result?: Maybe<Scalars['String']['output']>;
  subscriptionId: Scalars['ID']['output'];
  type: PredictionType;
};

export enum PredictionType {
  Data = 'DATA',
  Error = 'ERROR',
  Received = 'RECEIVED',
  Success = 'SUCCESS'
}

export type Prompt = {
  __typename?: 'Prompt';
  id: Scalars['ID']['output'];
  logicalCollection: Collection;
  name: Scalars['String']['output'];
  text: Scalars['String']['output'];
};

export type PromptInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  logicalCollection: Scalars['String']['input'];
  name: Scalars['String']['input'];
  text: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  checkIfUsersRespondedToInquiry?: Maybe<Array<Scalars['String']['output']>>;
  getAgent?: Maybe<Agent>;
  getAgentWithPrompts?: Maybe<Agent>;
  getAllAgents: Array<Agent>;
  getAllAudioVoices: Array<Voice>;
  getAllCapabilities: Array<Capability>;
  getAllCollections: Array<Collection>;
  getAllModels: Array<Model>;
  getAllPrompts?: Maybe<Array<Maybe<Prompt>>>;
  getAverageInquiryResponseTime: AverageInquiryResponseTime;
  getCapability?: Maybe<Capability>;
  getCollection?: Maybe<Collection>;
  getInquiries?: Maybe<Array<Inquiry>>;
  getInquiry?: Maybe<Inquiry>;
  getInquiryResponse?: Maybe<InquiryResponse>;
  getInquiryResponseCount: Scalars['Int']['output'];
  getInquiryResponses?: Maybe<Array<InquiryResponse>>;
  getInquiryTemplates: Array<Scalars['JSONObject']['output']>;
  getMediaAsset?: Maybe<Scalars['String']['output']>;
  getPrompt?: Maybe<Prompt>;
  getUsersByEmail?: Maybe<Array<Maybe<UserData>>>;
  getUsersById?: Maybe<Array<UserData>>;
  isUserRegistered: Scalars['Boolean']['output'];
};


export type QueryCheckIfUsersRespondedToInquiryArgs = {
  inquiryId: Scalars['ID']['input'];
  userEmails: Array<Scalars['String']['input']>;
};


export type QueryGetAgentArgs = {
  agentId: Scalars['ID']['input'];
};


export type QueryGetAgentWithPromptsArgs = {
  agentId: Scalars['ID']['input'];
};


export type QueryGetAllAgentsArgs = {
  logicalCollection?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetAllCapabilitiesArgs = {
  logicalCollection?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetAllPromptsArgs = {
  logicalCollection?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetAverageInquiryResponseTimeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetCapabilityArgs = {
  capabilityId: Scalars['ID']['input'];
};


export type QueryGetCollectionArgs = {
  collectionId: Scalars['ID']['input'];
};


export type QueryGetInquiryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetInquiryResponseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetInquiryResponseCountArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetInquiryResponsesArgs = {
  filters?: InputMaybe<InquiryResponseFilters>;
  id: Scalars['ID']['input'];
};


export type QueryGetMediaAssetArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetPromptArgs = {
  promptId: Scalars['ID']['input'];
};


export type QueryGetUsersByEmailArgs = {
  userEmails: Array<Scalars['String']['input']>;
};


export type QueryGetUsersByIdArgs = {
  userIds: Array<Scalars['String']['input']>;
};

export enum Role {
  Admin = 'admin',
  Default = 'default',
  Member = 'member'
}

export type StringFilter = {
  contains?: InputMaybe<Scalars['String']['input']>;
  endsWith?: InputMaybe<Scalars['String']['input']>;
  eq?: InputMaybe<Scalars['String']['input']>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  predictionAdded?: Maybe<Prediction>;
};


export type SubscriptionPredictionAddedArgs = {
  subscriptionId: Scalars['ID']['input'];
};

export type UserData = {
  __typename?: 'UserData';
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  primaryEmailAddress: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type UserDataInput = {
  firstName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  lastContacted?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  primaryEmailAddress: Scalars['String']['input'];
  username?: InputMaybe<Scalars['String']['input']>;
};

export type Voice = {
  __typename?: 'Voice';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  tags: Array<Scalars['String']['output']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AddMediaAssetResponse: ResolverTypeWrapper<AddMediaAssetResponse>;
  Agent: ResolverTypeWrapper<Agent>;
  AgentInput: AgentInput;
  AgentReasoning: ResolverTypeWrapper<AgentReasoning>;
  AgentReasoningInput: AgentReasoningInput;
  AverageInquiryResponseTime: ResolverTypeWrapper<AverageInquiryResponseTime>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Capability: ResolverTypeWrapper<Capability>;
  CapabilityInput: CapabilityInput;
  Collection: ResolverTypeWrapper<Collection>;
  CollectionInput: CollectionInput;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  FloatFilter: FloatFilter;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Inquiry: ResolverTypeWrapper<Inquiry>;
  InquiryData: ResolverTypeWrapper<InquiryData>;
  InquiryResponse: ResolverTypeWrapper<InquiryResponse>;
  InquiryResponseData: ResolverTypeWrapper<InquiryResponseData>;
  InquiryResponseFilters: InquiryResponseFilters;
  InquiryResponseStatus: InquiryResponseStatus;
  InquiryResponseUserDetails: ResolverTypeWrapper<InquiryResponseUserDetails>;
  InquirySettings: ResolverTypeWrapper<InquirySettings>;
  InquirySettingsNotifications: ResolverTypeWrapper<InquirySettingsNotifications>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSONObject: ResolverTypeWrapper<Scalars['JSONObject']['output']>;
  Model: ResolverTypeWrapper<Model>;
  Mutation: ResolverTypeWrapper<{}>;
  Prediction: ResolverTypeWrapper<Prediction>;
  PredictionType: PredictionType;
  Prompt: ResolverTypeWrapper<Prompt>;
  PromptInput: PromptInput;
  Query: ResolverTypeWrapper<{}>;
  Role: Role;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  StringFilter: StringFilter;
  Subscription: ResolverTypeWrapper<{}>;
  UserData: ResolverTypeWrapper<UserData>;
  UserDataInput: UserDataInput;
  Voice: ResolverTypeWrapper<Voice>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AddMediaAssetResponse: AddMediaAssetResponse;
  Agent: Agent;
  AgentInput: AgentInput;
  AgentReasoning: AgentReasoning;
  AgentReasoningInput: AgentReasoningInput;
  AverageInquiryResponseTime: AverageInquiryResponseTime;
  Boolean: Scalars['Boolean']['output'];
  Capability: Capability;
  CapabilityInput: CapabilityInput;
  Collection: Collection;
  CollectionInput: CollectionInput;
  Float: Scalars['Float']['output'];
  FloatFilter: FloatFilter;
  ID: Scalars['ID']['output'];
  Inquiry: Inquiry;
  InquiryData: InquiryData;
  InquiryResponse: InquiryResponse;
  InquiryResponseData: InquiryResponseData;
  InquiryResponseFilters: InquiryResponseFilters;
  InquiryResponseUserDetails: InquiryResponseUserDetails;
  InquirySettings: InquirySettings;
  InquirySettingsNotifications: InquirySettingsNotifications;
  Int: Scalars['Int']['output'];
  JSONObject: Scalars['JSONObject']['output'];
  Model: Model;
  Mutation: {};
  Prediction: Prediction;
  Prompt: Prompt;
  PromptInput: PromptInput;
  Query: {};
  String: Scalars['String']['output'];
  StringFilter: StringFilter;
  Subscription: {};
  UserData: UserData;
  UserDataInput: UserDataInput;
  Voice: Voice;
};

export type AuthDirectiveArgs = {
  requires?: Maybe<Role>;
};

export type AuthDirectiveResolver<Result, Parent, ContextType = any, Args = AuthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AddMediaAssetResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['AddMediaAssetResponse'] = ResolversParentTypes['AddMediaAssetResponse']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  signedUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Agent'] = ResolversParentTypes['Agent']> = {
  capabilities?: Resolver<Array<ResolversTypes['Capability']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  logicalCollection?: Resolver<ResolversTypes['Collection'], ParentType, ContextType>;
  memoryEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  outputFilter?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reasoning?: Resolver<Maybe<ResolversTypes['AgentReasoning']>, ParentType, ContextType>;
  subscriptionFilter?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgentReasoningResolvers<ContextType = any, ParentType extends ResolversParentTypes['AgentReasoning'] = ResolversParentTypes['AgentReasoning']> = {
  llmModel?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  prompt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  variablePassThrough?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AverageInquiryResponseTimeResolvers<ContextType = any, ParentType extends ResolversParentTypes['AverageInquiryResponseTime'] = ResolversParentTypes['AverageInquiryResponseTime']> = {
  minutes?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  responseCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CapabilityResolvers<ContextType = any, ParentType extends ResolversParentTypes['Capability'] = ResolversParentTypes['Capability']> = {
  alias?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  llmModel?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  logicalCollection?: Resolver<ResolversTypes['Collection'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  outputFilter?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  outputMode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  prompts?: Resolver<Array<ResolversTypes['Prompt']>, ParentType, ContextType>;
  subscriptionFilter?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CollectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Collection'] = ResolversParentTypes['Collection']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InquiryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Inquiry'] = ResolversParentTypes['Inquiry']> = {
  createdAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  data?: Resolver<ResolversTypes['InquiryData'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  responses?: Resolver<Maybe<Array<ResolversTypes['InquiryResponse']>>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  userId?: Resolver<Maybe<Array<ResolversTypes['ID']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InquiryDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['InquiryData'] = ResolversParentTypes['InquiryData']> = {
  draftGraph?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  graph?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  mcpTools?: Resolver<Array<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  settings?: Resolver<ResolversTypes['InquirySettings'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InquiryResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['InquiryResponse'] = ResolversParentTypes['InquiryResponse']> = {
  createdAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  data?: Resolver<ResolversTypes['InquiryResponseData'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InquiryResponseDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['InquiryResponseData'] = ResolversParentTypes['InquiryResponseData']> = {
  history?: Resolver<Array<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['InquiryResponseStatus'], ParentType, ContextType>;
  userDetails?: Resolver<Maybe<ResolversTypes['InquiryResponseUserDetails']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InquiryResponseUserDetailsResolvers<ContextType = any, ParentType extends ResolversParentTypes['InquiryResponseUserDetails'] = ResolversParentTypes['InquiryResponseUserDetails']> = {
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  recieveEmails?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InquirySettingsResolvers<ContextType = any, ParentType extends ResolversParentTypes['InquirySettings'] = ResolversParentTypes['InquirySettings']> = {
  context?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  goals?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  notifications?: Resolver<Maybe<ResolversTypes['InquirySettingsNotifications']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  voice?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InquirySettingsNotificationsResolvers<ContextType = any, ParentType extends ResolversParentTypes['InquirySettingsNotifications'] = ResolversParentTypes['InquirySettingsNotifications']> = {
  recieveEmailOnResponse?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSONObject'], any> {
  name: 'JSONObject';
}

export type ModelResolvers<ContextType = any, ParentType extends ResolversParentTypes['Model'] = ResolversParentTypes['Model']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  region?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addMediaAsset?: Resolver<Maybe<ResolversTypes['AddMediaAssetResponse']>, ParentType, ContextType>;
  addPrediction?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationAddPredictionArgs, 'agentId' | 'subscriptionId'>>;
  deleteAgent?: Resolver<Maybe<ResolversTypes['Agent']>, ParentType, ContextType, RequireFields<MutationDeleteAgentArgs, 'agentId'>>;
  deleteCapability?: Resolver<Maybe<ResolversTypes['Capability']>, ParentType, ContextType, RequireFields<MutationDeleteCapabilityArgs, 'capabilityId'>>;
  deleteCollection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType, RequireFields<MutationDeleteCollectionArgs, 'collectionId'>>;
  deleteInquiry?: Resolver<Maybe<ResolversTypes['Inquiry']>, ParentType, ContextType, RequireFields<MutationDeleteInquiryArgs, 'id'>>;
  deleteInquiryResponse?: Resolver<Maybe<ResolversTypes['InquiryResponse']>, ParentType, ContextType, RequireFields<MutationDeleteInquiryResponseArgs, 'id' | 'inquiryId'>>;
  deleteMediaAsset?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteMediaAssetArgs, 'id'>>;
  deletePrompt?: Resolver<Maybe<ResolversTypes['Prompt']>, ParentType, ContextType, RequireFields<MutationDeletePromptArgs, 'promptId'>>;
  emailInquiryToUsers?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationEmailInquiryToUsersArgs, 'inquiryId' | 'userData'>>;
  generateAudio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationGenerateAudioArgs, 'text' | 'voice'>>;
  registerUser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  updateInquiryOwners?: Resolver<ResolversTypes['Inquiry'], ParentType, ContextType, RequireFields<MutationUpdateInquiryOwnersArgs, 'id' | 'owners'>>;
  upsertAgent?: Resolver<Maybe<ResolversTypes['Agent']>, ParentType, ContextType, RequireFields<MutationUpsertAgentArgs, 'agent'>>;
  upsertCapability?: Resolver<Maybe<ResolversTypes['Capability']>, ParentType, ContextType, RequireFields<MutationUpsertCapabilityArgs, 'capability'>>;
  upsertCollection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType, RequireFields<MutationUpsertCollectionArgs, 'input'>>;
  upsertInquiry?: Resolver<ResolversTypes['Inquiry'], ParentType, ContextType, RequireFields<MutationUpsertInquiryArgs, 'data'>>;
  upsertInquiryResponse?: Resolver<ResolversTypes['InquiryResponse'], ParentType, ContextType, RequireFields<MutationUpsertInquiryResponseArgs, 'data' | 'inquiryId' | 'subscriptionId'>>;
  upsertPrompt?: Resolver<Maybe<ResolversTypes['Prompt']>, ParentType, ContextType, RequireFields<MutationUpsertPromptArgs, 'prompt'>>;
};

export type PredictionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Prediction'] = ResolversParentTypes['Prediction']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  result?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subscriptionId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['PredictionType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PromptResolvers<ContextType = any, ParentType extends ResolversParentTypes['Prompt'] = ResolversParentTypes['Prompt']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  logicalCollection?: Resolver<ResolversTypes['Collection'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  checkIfUsersRespondedToInquiry?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType, RequireFields<QueryCheckIfUsersRespondedToInquiryArgs, 'inquiryId' | 'userEmails'>>;
  getAgent?: Resolver<Maybe<ResolversTypes['Agent']>, ParentType, ContextType, RequireFields<QueryGetAgentArgs, 'agentId'>>;
  getAgentWithPrompts?: Resolver<Maybe<ResolversTypes['Agent']>, ParentType, ContextType, RequireFields<QueryGetAgentWithPromptsArgs, 'agentId'>>;
  getAllAgents?: Resolver<Array<ResolversTypes['Agent']>, ParentType, ContextType, Partial<QueryGetAllAgentsArgs>>;
  getAllAudioVoices?: Resolver<Array<ResolversTypes['Voice']>, ParentType, ContextType>;
  getAllCapabilities?: Resolver<Array<ResolversTypes['Capability']>, ParentType, ContextType, Partial<QueryGetAllCapabilitiesArgs>>;
  getAllCollections?: Resolver<Array<ResolversTypes['Collection']>, ParentType, ContextType>;
  getAllModels?: Resolver<Array<ResolversTypes['Model']>, ParentType, ContextType>;
  getAllPrompts?: Resolver<Maybe<Array<Maybe<ResolversTypes['Prompt']>>>, ParentType, ContextType, Partial<QueryGetAllPromptsArgs>>;
  getAverageInquiryResponseTime?: Resolver<ResolversTypes['AverageInquiryResponseTime'], ParentType, ContextType, RequireFields<QueryGetAverageInquiryResponseTimeArgs, 'id'>>;
  getCapability?: Resolver<Maybe<ResolversTypes['Capability']>, ParentType, ContextType, RequireFields<QueryGetCapabilityArgs, 'capabilityId'>>;
  getCollection?: Resolver<Maybe<ResolversTypes['Collection']>, ParentType, ContextType, RequireFields<QueryGetCollectionArgs, 'collectionId'>>;
  getInquiries?: Resolver<Maybe<Array<ResolversTypes['Inquiry']>>, ParentType, ContextType>;
  getInquiry?: Resolver<Maybe<ResolversTypes['Inquiry']>, ParentType, ContextType, RequireFields<QueryGetInquiryArgs, 'id'>>;
  getInquiryResponse?: Resolver<Maybe<ResolversTypes['InquiryResponse']>, ParentType, ContextType, RequireFields<QueryGetInquiryResponseArgs, 'id'>>;
  getInquiryResponseCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryGetInquiryResponseCountArgs, 'id'>>;
  getInquiryResponses?: Resolver<Maybe<Array<ResolversTypes['InquiryResponse']>>, ParentType, ContextType, RequireFields<QueryGetInquiryResponsesArgs, 'id'>>;
  getInquiryTemplates?: Resolver<Array<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  getMediaAsset?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryGetMediaAssetArgs, 'id'>>;
  getPrompt?: Resolver<Maybe<ResolversTypes['Prompt']>, ParentType, ContextType, RequireFields<QueryGetPromptArgs, 'promptId'>>;
  getUsersByEmail?: Resolver<Maybe<Array<Maybe<ResolversTypes['UserData']>>>, ParentType, ContextType, RequireFields<QueryGetUsersByEmailArgs, 'userEmails'>>;
  getUsersById?: Resolver<Maybe<Array<ResolversTypes['UserData']>>, ParentType, ContextType, RequireFields<QueryGetUsersByIdArgs, 'userIds'>>;
  isUserRegistered?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  predictionAdded?: SubscriptionResolver<Maybe<ResolversTypes['Prediction']>, "predictionAdded", ParentType, ContextType, RequireFields<SubscriptionPredictionAddedArgs, 'subscriptionId'>>;
};

export type UserDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserData'] = ResolversParentTypes['UserData']> = {
  firstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  primaryEmailAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VoiceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Voice'] = ResolversParentTypes['Voice']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  AddMediaAssetResponse?: AddMediaAssetResponseResolvers<ContextType>;
  Agent?: AgentResolvers<ContextType>;
  AgentReasoning?: AgentReasoningResolvers<ContextType>;
  AverageInquiryResponseTime?: AverageInquiryResponseTimeResolvers<ContextType>;
  Capability?: CapabilityResolvers<ContextType>;
  Collection?: CollectionResolvers<ContextType>;
  Inquiry?: InquiryResolvers<ContextType>;
  InquiryData?: InquiryDataResolvers<ContextType>;
  InquiryResponse?: InquiryResponseResolvers<ContextType>;
  InquiryResponseData?: InquiryResponseDataResolvers<ContextType>;
  InquiryResponseUserDetails?: InquiryResponseUserDetailsResolvers<ContextType>;
  InquirySettings?: InquirySettingsResolvers<ContextType>;
  InquirySettingsNotifications?: InquirySettingsNotificationsResolvers<ContextType>;
  JSONObject?: GraphQLScalarType;
  Model?: ModelResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Prediction?: PredictionResolvers<ContextType>;
  Prompt?: PromptResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  UserData?: UserDataResolvers<ContextType>;
  Voice?: VoiceResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = any> = {
  auth?: AuthDirectiveResolver<any, any, ContextType>;
};
