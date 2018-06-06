import {EventService, Component, Autowired, PostConstruct, Events, _,
    GridRow, RowNode, Constants, PinnedRowModel, IRowModel, ValueService, GridCore,
    CellNavigationService, Bean, Context, GridOptionsWrapper} from 'ag-grid/main';
import {StatusItem} from "./statusItem";
import {RangeController} from "../rangeController";

@Bean('statusBar')
export class StatusBar extends Component {

    private static TEMPLATE =
        '<div class="ag-status-bar">' +
        '</div>';

    //singletree begin
    @Autowired('gridApi') private gridApi: GridApi;
    //singletree end

    @Autowired('eventService') private eventService: EventService;
    @Autowired('rangeController') private rangeController: RangeController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('cellNavigationService') private cellNavigationService: CellNavigationService;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('context') private context: Context;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridCore') private gridCore: GridCore;

    //singletree begin
    private totalItems: StatusItem;
    private filteredItems: StatusItem;
    private selectedItems: StatusItem;
    //singletree end

    private statusItemSum: StatusItem;
    private statusItemCount: StatusItem;
    private statusItemMin: StatusItem;
    private statusItemMax: StatusItem;
    private statusItemAvg: StatusItem;

    private aggregationsComponent = new Component('<div class="ag-status-bar-aggregations"></div>');
    private infoLabel = new Component(`<div class="ag-status-bar-info-label"></div>`);

    constructor() {
        super(StatusBar.TEMPLATE);
    }

    @PostConstruct
    private init(): void {

      //singletree begin - don't initialize statusbar unless we are using it
      if(!this.gridOptionsWrapper.isEnableStatusBar())
      {
        return;
      }
      //singletree end
        // we want to hide until the first aggregation comes in
        this.setVisible(false);

        this.createStatusItems();
        this.eventService.addEventListener(Events.EVENT_RANGE_SELECTION_CHANGED, this.onRangeSelectionChanged.bind(this));
        //singletree begin
        this.eventService.addEventListener(Events.EVENT_SELECTION_CHANGED, this.onSelectionChanged.bind(this));
        this.eventService.addEventListener(Events.EVENT_MODEL_UPDATED, this.onRowDataChanged.bind(this));
        //singletree end
        this.eventService.addEventListener(Events.EVENT_MODEL_UPDATED, this.onRangeSelectionChanged.bind(this));
    }

    private createStatusItems(): void {
        let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

        //singletree begin
        this.totalItems = new StatusItem(localeTextFunc('rows', 'Total Rows'));
        this.filteredItems = new StatusItem(localeTextFunc('rows', 'Filtered'));
        this.selectedItems = new StatusItem(localeTextFunc('selected', 'Selected'));
        //singletree end

        this.statusItemSum = new StatusItem(localeTextFunc('sum', 'Sum'));
        this.statusItemCount = new StatusItem(localeTextFunc('count', 'Count'));
        this.statusItemMin = new StatusItem(localeTextFunc('min', 'Min'));
        this.statusItemMax = new StatusItem(localeTextFunc('max', 'Max'));
        this.statusItemAvg = new StatusItem(localeTextFunc('average', 'Average'));

        this.forEachStatusItem( (statusItem) => {
            this.context.wireBean(statusItem);
            this.aggregationsComponent.appendChild(statusItem);
            statusItem.setVisible(false);
        });

        this.appendChild(this.infoLabel);
        this.appendChild(this.aggregationsComponent);
    }

    private forEachStatusItem(callback: (statusItem: StatusItem)=>void): void {
        //singletree begin
        [this.totalItems, this.filteredItems, this.selectedItems, this.statusItemAvg, this.statusItemCount, this.statusItemMin, this.statusItemMax, this.statusItemSum].forEach(callback);
        //singletree end
    }

    private onRangeSelectionChanged(): void {
        let cellRanges = this.rangeController.getCellRanges();

        let sum = 0;
        let count = 0;
        let numberCount = 0;
        let min: number = null;
        let max: number = null;

        let cellsSoFar: any = {};

        if (!_.missingOrEmpty(cellRanges)) {

            cellRanges.forEach( (cellRange)=> {

                // get starting and ending row, remember rowEnd could be before rowStart
                let startRow = cellRange.start.getGridRow();
                let endRow = cellRange.end.getGridRow();

                let startRowIsFirst = startRow.before(endRow);

                let currentRow = startRowIsFirst ? startRow : endRow;
                let lastRow = startRowIsFirst ? endRow : startRow;

                while (true) {

                    let finishedAllRows = _.missing(currentRow) || lastRow.before(currentRow);
                    if (finishedAllRows) { break; }

                    cellRange.columns.forEach( (column) => {

                        // we only want to include each cell once, in case a cell is in multiple ranges
                        let cellId = currentRow.getGridCell(column).createId();
                        if (cellsSoFar[cellId]) {
                            return;
                        }
                        cellsSoFar[cellId] = true;

                        let rowNode = this.getRowNode(currentRow);
                        if (_.missing(rowNode)) { return; }

                        let value = this.valueService.getValue(column, rowNode);

                        // if empty cell, skip it, doesn't impact count or anything
                        if (_.missing(value) || value === '') {
                            return;
                        }

                        // see if value is wrapped, can happen when doing count() or avg() functions
                        if (value.value) {
                            value = value.value;
                        }

                        if (typeof value === 'string') {
                            value = Number(value);
                        }

                        if (typeof value === 'number' && !isNaN(value)) {

                            sum += value;

                            if (max === null || value > max) {
                                max = value;
                            }

                            if (min === null || value < min) {
                                min = value;
                            }

                            numberCount++;
                        }
                        count++;
                    });

                    currentRow = this.cellNavigationService.getRowBelow(currentRow);
                }
            });
        }

        let gotResult = this.gridOptionsWrapper.isAlwaysShowStatusBar() || count > 1;
        let gotNumberResult = numberCount > 1;

        // we should count even if no numbers
        if (gotResult) {
            this.statusItemCount.setValue(count);
        }
        this.statusItemCount.setVisible(gotResult);

        // if numbers, then show the number items
        if (gotNumberResult) {
            this.statusItemSum.setValue(sum);
            this.statusItemMin.setValue(min);
            this.statusItemMax.setValue(max);
            this.statusItemAvg.setValue(sum / numberCount);
        }
        this.statusItemSum.setVisible(gotNumberResult);
        this.statusItemMin.setVisible(gotNumberResult);
        this.statusItemMax.setVisible(gotNumberResult);
        this.statusItemAvg.setVisible(gotNumberResult);

        if (this.isVisible()!==gotResult) {
            this.setVisible(gotResult);
            this.gridCore.doLayout();
        }
    }

    private getRowNode(gridRow: GridRow): RowNode {
        switch (gridRow.floating) {
            case Constants.PINNED_TOP:
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case Constants.PINNED_BOTTOM:
                return this.pinnedRowModel.getPinnedBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    }

    //singletree begin
    private onSelectionChanged() {
        var selectedRows = 0;

        this.gridApi.forEachNodeAfterFilterAndSort((rowNode) => {
            if (!rowNode.group && rowNode.isSelected()) {
                selectedRows++;
            }
        });

        this.selectedItems.setValue(selectedRows);
        this.selectedItems.setVisible(selectedRows > 0);
    }

    private onRowDataChanged() {
        var filteredRows = 0;
        var totalRows = (<any> this.gridApi.getModel()).rootNode.allLeafChildren.length;


        this.gridApi.forEachNodeAfterFilter((n) => {
            if (!n.group) {
                filteredRows++;
            }
        });

        this.filteredItems.setValue(filteredRows);
        this.filteredItems.setVisible(filteredRows !== totalRows);

        this.totalItems.setValue(totalRows);
        this.totalItems.setVisible(true);

        this.onSelectionChanged();
    }
    //singletree end
}
