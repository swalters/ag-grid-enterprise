// ag-grid-enterprise v9.1.2
import { IMenuFactory, Column } from "ag-grid";
export declare class EnterpriseMenuFactory implements IMenuFactory {
    private context;
    private popupService;
    private gridOptionsWrapper;
    private lastSelectedTab;
    showMenuAfterMouseEvent(column: Column, mouseEvent: MouseEvent, defaultTab?: string): void;
    showMenuAfterButtonClick(column: Column, eventSource: HTMLElement, defaultTab?: string): void;
    showMenu(column: Column, positionCallback: (menu: EnterpriseMenu) => void, defaultTab?: string): void;
    isMenuEnabled(column: Column): boolean;
}
export declare class EnterpriseMenu {
    static EVENT_TAB_SELECTED: string;
    static TAB_FILTER: string;
    static TAB_GENERAL: string;
    static TAB_COLUMNS: string;
    static MENU_ITEM_SEPARATOR: string;
    private columnController;
    private filterManager;
    private context;
    private gridApi;
    private gridOptionsWrapper;
    private eventService;
    private menuItemMapper;
    private tabbedLayout;
    private hidePopupFunc;
    private column;
    private mainMenuList;
    private columnSelectPanel;
    private localEventService;
    private tabItemFilter;
    private tabItemGeneral;
    private tabItemColumns;
    private initialSelection;
    private destroyFunctions;
    constructor(column: Column, initialSelection: string);
    addEventListener(event: string, listener: Function): void;
    getMinWidth(): number;
    init(): void;
    showTabBasedOnPreviousSelection(): void;
    showTab(toShow: string): void;
    private onTabItemClicked(event);
    destroy(): void;
    private getMenuItems();
    private getDefaultMenuOptions();
    private createMainPanel();
    private onHidePopup();
    private createFilterPanel();
    private createColumnsPanel();
    afterGuiAttached(params: any): void;
    getGui(): HTMLElement;
}
