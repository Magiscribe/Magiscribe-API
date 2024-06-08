const templateAppState = `
The code shall define a function called generate_appStateDict() that creates a variable called appStateDict sets it equal to a JSON and returns it.
The code should also call the function with the provided parameters and set the returned value equal to appStateDict. 
This will be the only variable because the written function can only be called once. 
Do NOT print(appStateDict), do NOT JSON.dumps(appStateDict), the very last line of code should always be: 
  appStateDict = generate_appStateDict() #Possibly with parameters
The appStateDict JSON that gets returned should only contain the necessary properties to satisfy the user request

The Type Definition of appState is: 
export interface AppState {
  contextMenu: {
    items: ContextMenuItems;
    top: number;
    left: number;
  } | null;
  showWelcomeScreen: boolean;
  isLoading: boolean;
  errorMessage: React.ReactNode;
  activeEmbeddable: {
    element: NonDeletedExcalidrawElement;
    state: "hover" | "active";
  } | null;
  draggingElement: NonDeletedExcalidrawElement | null;
  resizingElement: NonDeletedExcalidrawElement | null;
  multiElement: NonDeleted<ExcalidrawLinearElement> | null;
  selectionElement: NonDeletedExcalidrawElement | null;
  isBindingEnabled: boolean;
  startBoundElement: NonDeleted<ExcalidrawBindableElement> | null;
  suggestedBindings: SuggestedBinding[];
  frameToHighlight: NonDeleted<ExcalidrawFrameLikeElement> | null;
  frameRendering: {
    enabled: boolean;
    name: boolean;
    outline: boolean;
    clip: boolean;
  };
  editingFrame: string | null;
  elementsToHighlight: NonDeleted<ExcalidrawElement>[] | null;
  editingElement: NonDeletedExcalidrawElement | null;
  editingLinearElement: LinearElementEditor | null;
  activeTool: {
    lastActiveTool: ActiveTool | null;
    locked: boolean;
  } & ActiveTool;
  penMode: boolean;
  penDetected: boolean;
  exportBackground: boolean;
  exportEmbedScene: boolean;
  exportWithDarkMode: boolean;
  exportScale: number;
  currentItemStrokeColor: string;
  currentItemBackgroundColor: string;
  currentItemFillStyle: ExcalidrawElement["fillStyle"];
  currentItemStrokeWidth: number;
  currentItemStrokeStyle: ExcalidrawElement["strokeStyle"];
  currentItemRoughness: number;
  currentItemOpacity: number;
  currentItemFontFamily: FontFamilyValues;
  currentItemFontSize: number;
  currentItemTextAlign: TextAlign;
  currentItemStartArrowhead: Arrowhead | null;
  currentItemEndArrowhead: Arrowhead | null;
  currentItemRoundness: StrokeRoundness;
  viewBackgroundColor: string;
  scrollX: number;
  scrollY: number;
  cursorButton: "up" | "down";
  scrolledOutside: boolean;
  name: string | null;
  isResizing: boolean;
  isRotating: boolean;
  zoom: Zoom;
  openMenu: "canvas" | "shape" | null;
  openPopup: "canvasBackground" | "elementBackground" | "elementStroke" | null;
  openSidebar: { name: SidebarName; tab?: SidebarTabName } | null;
  openDialog:
    | null
    | { name: "imageExport" | "help" | "jsonExport" }
    | {
        name: "settings";
        source:
          | "tool" 
          | "generation" 
          | "settings"; 
        tab: "text-to-diagram" | "diagram-to-code";
      }
    | { name: "ttd"; tab: "text-to-diagram" | "mermaid" }
    | { name: "commandPalette" };
  defaultSidebarDockedPreference: boolean;
  lastPointerDownWith: PointerType;
  selectedElementIds: Readonly<{ [id: string]: true }>;
  previousSelectedElementIds: { [id: string]: true };
  selectedElementsAreBeingDragged: boolean;
  shouldCacheIgnoreZoom: boolean;
  toast: { message: string; closable?: boolean; duration?: number } | null;
  zenModeEnabled: boolean;
  theme: Theme;
  gridSize: number | null;
  viewModeEnabled: boolean;
  selectedGroupIds: { [groupId: string]: boolean };
  editingGroupId: GroupId | null;
  width: number;
  height: number;
  offsetTop: number;
  offsetLeft: number;
  fileHandle: FileSystemHandle | null;
  collaborators: Map<SocketId, Collaborator>;
  showStats: boolean;
  currentChartType: ChartType;
  pasteDialog:
    | {
        shown: false;
        data: null;
      }
    | {
        shown: true;
        data: Spreadsheet;
      };
  pendingImageElementId: ExcalidrawImageElement["id"] | null;
  showHyperlinkPopup: false | "info" | "editor";
  selectedLinearElement: LinearElementEditor | null;
  snapLines: readonly SnapLine[];
  originSnapOffset: {
    x: number;
    y: number;
  } | null;
  objectsSnapModeEnabled: boolean;
  userToFollow: UserToFollow | null;
  followedBy: Set<SocketId>;
}

`;


export default templateAppState;