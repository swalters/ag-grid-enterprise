// ag-grid-enterprise v17.1.1
import { Component } from 'ag-grid/main';
export declare class StatusBar extends Component {
    private static TEMPLATE;
    private gridApi;
    private eventService;
    private rangeController;
    private valueService;
    private cellNavigationService;
    private pinnedRowModel;
    private rowModel;
    private context;
    private gridOptionsWrapper;
    private gridCore;
    private totalItems;
    private filteredItems;
    private selectedItems;
    private statusItemSum;
    private statusItemCount;
    private statusItemMin;
    private statusItemMax;
    private statusItemAvg;
    private aggregationsComponent;
    private infoLabel;
    constructor();
    private init();
    private createStatusItems();
    private forEachStatusItem(callback);
    private onRangeSelectionChanged();
    private getRowNode(gridRow);
    private onSelectionChanged();
    private onRowDataChanged();
}
