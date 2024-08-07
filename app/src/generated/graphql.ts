import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  JSONObject: { input: any; output: any };
};

export type Agent = {
  __typename?: 'Agent';
  capabilities: Array<Maybe<Capability>>;
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  memoryEnabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  outputFilter?: Maybe<Scalars['String']['output']>;
  reasoning?: Maybe<AgentReasoning>;
  subscriptionFilter?: Maybe<Scalars['String']['output']>;
};

export type AgentInput = {
  capabilities: Array<InputMaybe<Scalars['String']['input']>>;
  description: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
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

export type Capability = {
  __typename?: 'Capability';
  alias: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  llmModel: Scalars['String']['output'];
  name: Scalars['String']['output'];
  outputFilter?: Maybe<Scalars['String']['output']>;
  outputMode: Scalars['String']['output'];
  prompts?: Maybe<Array<Maybe<Prompt>>>;
  subscriptionFilter?: Maybe<Scalars['String']['output']>;
};

export type CapabilityInput = {
  alias: Scalars['String']['input'];
  description: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  llmModel?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  outputFilter?: InputMaybe<Scalars['String']['input']>;
  outputMode?: InputMaybe<Scalars['String']['input']>;
  prompts?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  subscriptionFilter?: InputMaybe<Scalars['String']['input']>;
};

export type DataObject = {
  __typename?: 'DataObject';
  data: Scalars['JSONObject']['output'];
  id: Scalars['String']['output'];
};

export type Element = {
  __typename?: 'Element';
  _id: Scalars['String']['output'];
  elementType: Scalars['String']['output'];
  offsetX: Scalars['Float']['output'];
  offsetY: Scalars['Float']['output'];
  options: Scalars['JSONObject']['output'];
};

export type ElementCreateInput = {
  elementType: Scalars['String']['input'];
  offsetX: Scalars['Float']['input'];
  offsetY: Scalars['Float']['input'];
  options: Scalars['JSONObject']['input'];
};

export type ElementUpdateInput = {
  elementType?: InputMaybe<Scalars['String']['input']>;
  offsetX?: InputMaybe<Scalars['Float']['input']>;
  offsetY?: InputMaybe<Scalars['Float']['input']>;
  options?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type Frame = {
  __typename?: 'Frame';
  _id: Scalars['String']['output'];
  childElements: Array<Element>;
  childFrames: Array<Frame>;
  endX: Scalars['Float']['output'];
  endY: Scalars['Float']['output'];
  height: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  offsetX: Scalars['Float']['output'];
  offsetY: Scalars['Float']['output'];
  startX: Scalars['Float']['output'];
  startY: Scalars['Float']['output'];
  width: Scalars['Float']['output'];
};

export type FrameCreateInput = {
  endX: Scalars['Float']['input'];
  endY: Scalars['Float']['input'];
  height: Scalars['Float']['input'];
  name: Scalars['String']['input'];
  offsetX: Scalars['Float']['input'];
  offsetY: Scalars['Float']['input'];
  startX: Scalars['Float']['input'];
  startY: Scalars['Float']['input'];
  width: Scalars['Float']['input'];
};

export type FrameUpdateInput = {
  endX?: InputMaybe<Scalars['Float']['input']>;
  endY?: InputMaybe<Scalars['Float']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  offsetX?: InputMaybe<Scalars['Float']['input']>;
  offsetY?: InputMaybe<Scalars['Float']['input']>;
  startX?: InputMaybe<Scalars['Float']['input']>;
  startY?: InputMaybe<Scalars['Float']['input']>;
  width?: InputMaybe<Scalars['Float']['input']>;
};

export type Model = {
  __typename?: 'Model';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  region: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addChildElements?: Maybe<Frame>;
  addChildFrames?: Maybe<Frame>;
  addMediaAsset?: Maybe<Scalars['String']['output']>;
  addPrediction?: Maybe<Scalars['String']['output']>;
  addUpdateAgent?: Maybe<Agent>;
  addUpdateCapability?: Maybe<Capability>;
  addUpdatePrompt?: Maybe<Prompt>;
  createElement?: Maybe<Element>;
  createFrame?: Maybe<Frame>;
  createUpdateDataObject: DataObject;
  deleteAgent?: Maybe<Agent>;
  deleteCapability?: Maybe<Capability>;
  deleteElement?: Maybe<Element>;
  deleteFrame?: Maybe<Frame>;
  deletePrompt?: Maybe<Prompt>;
  generateAudio?: Maybe<Scalars['String']['output']>;
  generateTranscriptionStreamingCredentials?: Maybe<TemporaryCredentials>;
  insertIntoDataObject: DataObject;
  updateElement?: Maybe<Element>;
  updateFrame?: Maybe<Frame>;
};

export type MutationAddChildElementsArgs = {
  childElementIds: Array<Scalars['String']['input']>;
  frameId: Scalars['String']['input'];
};

export type MutationAddChildFramesArgs = {
  childFrameIds: Array<Scalars['String']['input']>;
  frameId: Scalars['String']['input'];
};

export type MutationAddMediaAssetArgs = {
  fileName: Scalars['String']['input'];
  fileType: Scalars['String']['input'];
};

export type MutationAddPredictionArgs = {
  agentId: Scalars['String']['input'];
  subscriptionId: Scalars['String']['input'];
  variables?: InputMaybe<Scalars['JSONObject']['input']>;
};

export type MutationAddUpdateAgentArgs = {
  agent: AgentInput;
};

export type MutationAddUpdateCapabilityArgs = {
  capability: CapabilityInput;
};

export type MutationAddUpdatePromptArgs = {
  prompt: PromptInput;
};

export type MutationCreateElementArgs = {
  element: ElementCreateInput;
};

export type MutationCreateFrameArgs = {
  frame: FrameCreateInput;
};

export type MutationCreateUpdateDataObjectArgs = {
  data: Scalars['JSONObject']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
};

export type MutationDeleteAgentArgs = {
  agentId: Scalars['String']['input'];
};

export type MutationDeleteCapabilityArgs = {
  capabilityId: Scalars['String']['input'];
};

export type MutationDeleteElementArgs = {
  elementId: Scalars['String']['input'];
};

export type MutationDeleteFrameArgs = {
  frameId: Scalars['String']['input'];
};

export type MutationDeletePromptArgs = {
  promptId: Scalars['String']['input'];
};

export type MutationGenerateAudioArgs = {
  text: Scalars['String']['input'];
  voice: Scalars['String']['input'];
};

export type MutationInsertIntoDataObjectArgs = {
  field: Scalars['String']['input'];
  id: Scalars['String']['input'];
  value: Scalars['JSONObject']['input'];
};

export type MutationUpdateElementArgs = {
  element: ElementUpdateInput;
  elementId: Scalars['String']['input'];
};

export type MutationUpdateFrameArgs = {
  frame: FrameUpdateInput;
  frameId: Scalars['String']['input'];
};

export type Prediction = {
  __typename?: 'Prediction';
  id: Scalars['String']['output'];
  result?: Maybe<Scalars['String']['output']>;
  subscriptionId: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export enum PredictionType {
  Data = 'DATA',
  Error = 'ERROR',
  RECEIVED = 'RECEIVED',
  Success = 'SUCCESS',
}

export type Prompt = {
  __typename?: 'Prompt';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  text: Scalars['String']['output'];
};

export type PromptInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  text: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  dataObject: DataObject;
  dataObjectsCreated: Array<DataObject>;
  getAgent?: Maybe<Agent>;
  getAllAgents?: Maybe<Array<Maybe<Agent>>>;
  getAllCapabilities?: Maybe<Array<Maybe<Capability>>>;
  getAllModels?: Maybe<Array<Maybe<Model>>>;
  getAllPrompts?: Maybe<Array<Maybe<Prompt>>>;
  getCapability?: Maybe<Capability>;
  getElement?: Maybe<Element>;
  getFrame?: Maybe<Frame>;
  getPrompt?: Maybe<Prompt>;
};

export type QueryDataObjectArgs = {
  id: Scalars['String']['input'];
};

export type QueryGetAgentArgs = {
  agentId: Scalars['String']['input'];
};

export type QueryGetCapabilityArgs = {
  capabilityId: Scalars['String']['input'];
};

export type QueryGetElementArgs = {
  elementId: Scalars['String']['input'];
};

export type QueryGetFrameArgs = {
  frameId: Scalars['String']['input'];
};

export type QueryGetPromptArgs = {
  promptId: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  predictionAdded?: Maybe<Prediction>;
};

export type SubscriptionPredictionAddedArgs = {
  subscriptionId: Scalars['String']['input'];
};

export type TemporaryCredentials = {
  __typename?: 'TemporaryCredentials';
  accessKeyId: Scalars['String']['output'];
  secretAccessKey: Scalars['String']['output'];
  sessionToken: Scalars['String']['output'];
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {},
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo,
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo,
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {},
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Agent: ResolverTypeWrapper<Agent>;
  AgentInput: AgentInput;
  AgentReasoning: ResolverTypeWrapper<AgentReasoning>;
  AgentReasoningInput: AgentReasoningInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Capability: ResolverTypeWrapper<Capability>;
  CapabilityInput: CapabilityInput;
  DataObject: ResolverTypeWrapper<DataObject>;
  Element: ResolverTypeWrapper<Element>;
  ElementCreateInput: ElementCreateInput;
  ElementUpdateInput: ElementUpdateInput;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Frame: ResolverTypeWrapper<Frame>;
  FrameCreateInput: FrameCreateInput;
  FrameUpdateInput: FrameUpdateInput;
  JSONObject: ResolverTypeWrapper<Scalars['JSONObject']['output']>;
  Model: ResolverTypeWrapper<Model>;
  Mutation: ResolverTypeWrapper<{}>;
  Prediction: ResolverTypeWrapper<Prediction>;
  PredictionType: PredictionType;
  Prompt: ResolverTypeWrapper<Prompt>;
  PromptInput: PromptInput;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  TemporaryCredentials: ResolverTypeWrapper<TemporaryCredentials>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Agent: Agent;
  AgentInput: AgentInput;
  AgentReasoning: AgentReasoning;
  AgentReasoningInput: AgentReasoningInput;
  Boolean: Scalars['Boolean']['output'];
  Capability: Capability;
  CapabilityInput: CapabilityInput;
  DataObject: DataObject;
  Element: Element;
  ElementCreateInput: ElementCreateInput;
  ElementUpdateInput: ElementUpdateInput;
  Float: Scalars['Float']['output'];
  Frame: Frame;
  FrameCreateInput: FrameCreateInput;
  FrameUpdateInput: FrameUpdateInput;
  JSONObject: Scalars['JSONObject']['output'];
  Model: Model;
  Mutation: {};
  Prediction: Prediction;
  Prompt: Prompt;
  PromptInput: PromptInput;
  Query: {};
  String: Scalars['String']['output'];
  Subscription: {};
  TemporaryCredentials: TemporaryCredentials;
};

export type AgentResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes['Agent'] = ResolversParentTypes['Agent'],
> = {
  capabilities?: Resolver<
    Array<Maybe<ResolversTypes['Capability']>>,
    ParentType,
    ContextType
  >;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  memoryEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  outputFilter?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  reasoning?: Resolver<
    Maybe<ResolversTypes['AgentReasoning']>,
    ParentType,
    ContextType
  >;
  subscriptionFilter?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgentReasoningResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes['AgentReasoning'] = ResolversParentTypes['AgentReasoning'],
> = {
  llmModel?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  prompt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  variablePassThrough?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CapabilityResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes['Capability'] = ResolversParentTypes['Capability'],
> = {
  alias?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  llmModel?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  outputFilter?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  outputMode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  prompts?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Prompt']>>>,
    ParentType,
    ContextType
  >;
  subscriptionFilter?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DataObjectResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes['DataObject'] = ResolversParentTypes['DataObject'],
> = {
  data?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ElementResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes['Element'] = ResolversParentTypes['Element'],
> = {
  _id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  elementType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  offsetX?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  offsetY?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  options?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FrameResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes['Frame'] = ResolversParentTypes['Frame'],
> = {
  _id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  childElements?: Resolver<
    Array<ResolversTypes['Element']>,
    ParentType,
    ContextType
  >;
  childFrames?: Resolver<
    Array<ResolversTypes['Frame']>,
    ParentType,
    ContextType
  >;
  endX?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  endY?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  height?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  offsetX?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  offsetY?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  startX?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  startY?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  width?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonObjectScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['JSONObject'], any> {
  name: 'JSONObject';
}

export type ModelResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes['Model'] = ResolversParentTypes['Model'],
> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  region?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation'],
> = {
  addChildElements?: Resolver<
    Maybe<ResolversTypes['Frame']>,
    ParentType,
    ContextType,
    RequireFields<MutationAddChildElementsArgs, 'childElementIds' | 'frameId'>
  >;
  addChildFrames?: Resolver<
    Maybe<ResolversTypes['Frame']>,
    ParentType,
    ContextType,
    RequireFields<MutationAddChildFramesArgs, 'childFrameIds' | 'frameId'>
  >;
  addMediaAsset?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType,
    RequireFields<MutationAddMediaAssetArgs, 'fileName' | 'fileType'>
  >;
  addPrediction?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType,
    RequireFields<MutationAddPredictionArgs, 'agentId' | 'subscriptionId'>
  >;
  addUpdateAgent?: Resolver<
    Maybe<ResolversTypes['Agent']>,
    ParentType,
    ContextType,
    RequireFields<MutationAddUpdateAgentArgs, 'agent'>
  >;
  addUpdateCapability?: Resolver<
    Maybe<ResolversTypes['Capability']>,
    ParentType,
    ContextType,
    RequireFields<MutationAddUpdateCapabilityArgs, 'capability'>
  >;
  addUpdatePrompt?: Resolver<
    Maybe<ResolversTypes['Prompt']>,
    ParentType,
    ContextType,
    RequireFields<MutationAddUpdatePromptArgs, 'prompt'>
  >;
  createElement?: Resolver<
    Maybe<ResolversTypes['Element']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateElementArgs, 'element'>
  >;
  createFrame?: Resolver<
    Maybe<ResolversTypes['Frame']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateFrameArgs, 'frame'>
  >;
  createUpdateDataObject?: Resolver<
    ResolversTypes['DataObject'],
    ParentType,
    ContextType,
    RequireFields<MutationCreateUpdateDataObjectArgs, 'data'>
  >;
  deleteAgent?: Resolver<
    Maybe<ResolversTypes['Agent']>,
    ParentType,
    ContextType,
    RequireFields<MutationDeleteAgentArgs, 'agentId'>
  >;
  deleteCapability?: Resolver<
    Maybe<ResolversTypes['Capability']>,
    ParentType,
    ContextType,
    RequireFields<MutationDeleteCapabilityArgs, 'capabilityId'>
  >;
  deleteElement?: Resolver<
    Maybe<ResolversTypes['Element']>,
    ParentType,
    ContextType,
    RequireFields<MutationDeleteElementArgs, 'elementId'>
  >;
  deleteFrame?: Resolver<
    Maybe<ResolversTypes['Frame']>,
    ParentType,
    ContextType,
    RequireFields<MutationDeleteFrameArgs, 'frameId'>
  >;
  deletePrompt?: Resolver<
    Maybe<ResolversTypes['Prompt']>,
    ParentType,
    ContextType,
    RequireFields<MutationDeletePromptArgs, 'promptId'>
  >;
  generateAudio?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType,
    RequireFields<MutationGenerateAudioArgs, 'text' | 'voice'>
  >;
  generateTranscriptionStreamingCredentials?: Resolver<
    Maybe<ResolversTypes['TemporaryCredentials']>,
    ParentType,
    ContextType
  >;
  insertIntoDataObject?: Resolver<
    ResolversTypes['DataObject'],
    ParentType,
    ContextType,
    RequireFields<MutationInsertIntoDataObjectArgs, 'field' | 'id' | 'value'>
  >;
  updateElement?: Resolver<
    Maybe<ResolversTypes['Element']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateElementArgs, 'element' | 'elementId'>
  >;
  updateFrame?: Resolver<
    Maybe<ResolversTypes['Frame']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateFrameArgs, 'frame' | 'frameId'>
  >;
};

export type PredictionResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes['Prediction'] = ResolversParentTypes['Prediction'],
> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  result?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subscriptionId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PromptResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes['Prompt'] = ResolversParentTypes['Prompt'],
> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes['Query'] = ResolversParentTypes['Query'],
> = {
  dataObject?: Resolver<
    ResolversTypes['DataObject'],
    ParentType,
    ContextType,
    RequireFields<QueryDataObjectArgs, 'id'>
  >;
  dataObjectsCreated?: Resolver<
    Array<ResolversTypes['DataObject']>,
    ParentType,
    ContextType
  >;
  getAgent?: Resolver<
    Maybe<ResolversTypes['Agent']>,
    ParentType,
    ContextType,
    RequireFields<QueryGetAgentArgs, 'agentId'>
  >;
  getAllAgents?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Agent']>>>,
    ParentType,
    ContextType
  >;
  getAllCapabilities?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Capability']>>>,
    ParentType,
    ContextType
  >;
  getAllModels?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Model']>>>,
    ParentType,
    ContextType
  >;
  getAllPrompts?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Prompt']>>>,
    ParentType,
    ContextType
  >;
  getCapability?: Resolver<
    Maybe<ResolversTypes['Capability']>,
    ParentType,
    ContextType,
    RequireFields<QueryGetCapabilityArgs, 'capabilityId'>
  >;
  getElement?: Resolver<
    Maybe<ResolversTypes['Element']>,
    ParentType,
    ContextType,
    RequireFields<QueryGetElementArgs, 'elementId'>
  >;
  getFrame?: Resolver<
    Maybe<ResolversTypes['Frame']>,
    ParentType,
    ContextType,
    RequireFields<QueryGetFrameArgs, 'frameId'>
  >;
  getPrompt?: Resolver<
    Maybe<ResolversTypes['Prompt']>,
    ParentType,
    ContextType,
    RequireFields<QueryGetPromptArgs, 'promptId'>
  >;
};

export type SubscriptionResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription'],
> = {
  predictionAdded?: SubscriptionResolver<
    Maybe<ResolversTypes['Prediction']>,
    'predictionAdded',
    ParentType,
    ContextType,
    RequireFields<SubscriptionPredictionAddedArgs, 'subscriptionId'>
  >;
};

export type TemporaryCredentialsResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes['TemporaryCredentials'] = ResolversParentTypes['TemporaryCredentials'],
> = {
  accessKeyId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  secretAccessKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sessionToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Agent?: AgentResolvers<ContextType>;
  AgentReasoning?: AgentReasoningResolvers<ContextType>;
  Capability?: CapabilityResolvers<ContextType>;
  DataObject?: DataObjectResolvers<ContextType>;
  Element?: ElementResolvers<ContextType>;
  Frame?: FrameResolvers<ContextType>;
  JSONObject?: GraphQLScalarType;
  Model?: ModelResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Prediction?: PredictionResolvers<ContextType>;
  Prompt?: PromptResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  TemporaryCredentials?: TemporaryCredentialsResolvers<ContextType>;
};
