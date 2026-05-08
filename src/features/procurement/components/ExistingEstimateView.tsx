"use client";

import {
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { ExistingEstimateRow } from "../../../types/procurement";
import {
  calculateEstimatePrice,
  createInitialColumnWidths,
  estimateColumns,
  formatEstimatePrice,
  getUniqueOptions,
  type EstimateColumn,
  type EstimateColumnKey,
} from "../existing-estimate-table";
import styles from "./ExistingEstimateView.module.css";

const supplierNamesByCode: Record<string, string> = {
  "0419": "大阪鋼管株式会社",
};

type EditableField = "processName" | "itemName" | "material";

type ExistingEstimateViewProps = {
  isReflected: boolean;
  onRowsChange: (rows: ExistingEstimateRow[]) => void;
  rows: ExistingEstimateRow[];
};

export function ExistingEstimateView({
  isReflected,
  onRowsChange,
  rows,
}: ExistingEstimateViewProps) {
  const [supplierCode, setSupplierCode] = useState("0419");
  const [supplierName, setSupplierName] = useState(supplierNamesByCode["0419"]);
  const [selectedRowNos, setSelectedRowNos] = useState<Set<number>>(
    () => new Set(),
  );
  const [columnWidths, setColumnWidths] = useState<Record<EstimateColumnKey, number>>(
    () => createInitialColumnWidths(),
  );
  const tableWidth = estimateColumns.reduce(
    (sum, column) => sum + columnWidths[column.key],
    0,
  );
  const itemNameOptions = getUniqueOptions(rows, "itemName", []);
  const materialOptions = getUniqueOptions(rows, "material", [
    "SUS304",
    "SUS316L",
    "SUS310S",
  ]);
  const processNameOptions = getUniqueOptions(rows, "processName", [
    "伝熱管",
    "加工",
    "熱処理",
    "試験",
  ]);

  const handleSupplierCodeKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    setSupplierName(supplierNamesByCode[supplierCode.trim()] ?? "");
  };

  const toggleSelectedRow = (rowNo: number) => {
    setSelectedRowNos((currentRowNos) => {
      const nextRowNos = new Set(currentRowNos);

      if (nextRowNos.has(rowNo)) {
        nextRowNos.delete(rowNo);
      } else {
        nextRowNos.add(rowNo);
      }

      return nextRowNos;
    });
  };

  const updateEditableCell = (
    rowNo: number,
    field: EditableField,
    value: string,
  ) => {
    onRowsChange(
      rows.map((row) =>
        row.rowNo === rowNo ? { ...row, [field]: value } : row,
      ),
    );
  };

  const handleColumnResizeStart = (
    event: ReactPointerEvent<HTMLButtonElement>,
    column: EstimateColumn,
  ) => {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = columnWidths[column.key];

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextWidth = Math.max(
        column.minWidth,
        startWidth + moveEvent.clientX - startX,
      );

      setColumnWidths((currentWidths) => ({
        ...currentWidths,
        [column.key]: nextWidth,
      }));
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };

  return (
    <section className={styles.panel} aria-label="現行見積作成画面イメージ">
      <div className={styles.titleBar}>列設定</div>
      <div className={styles.toolbar}>
        <div className={styles.group}>
          <div className={styles.groupTitle}>見積依頼先</div>
          <div className={styles.inlineRow}>
            <span className={styles.tinyLabel}>コード</span>
            <input
              className={styles.tinyInput}
              onChange={(event) => {
                setSupplierCode(event.target.value);
                setSupplierName("");
              }}
              onKeyDown={handleSupplierCodeKeyDown}
              value={supplierCode}
            />
            <input className={styles.textInput} readOnly value={supplierName} />
            <button className={styles.ellipsisButton} type="button">...</button>
          </div>
        </div>
        <div className={styles.group}>
          <div className={styles.groupTitle}>出力</div>
          <div className={styles.inlineRow}>
            <label className={styles.checkboxLabel}><input type="checkbox" />見積依頼</label>
            <label className={styles.checkboxLabel}><input type="checkbox" />内示手配</label>
          </div>
        </div>
        <div className={styles.group}>
          <div className={styles.groupTitle}>国内外</div>
          <div className={styles.inlineRow}>
            <label className={styles.radioLabel}><input defaultChecked name="area" type="radio" />国内向け</label>
            <label className={styles.radioLabel}><input name="area" type="radio" />海外調達向け</label>
          </div>
        </div>
      </div>

      <div className={styles.formArea}>
        <div className={styles.group}>
          <div className={styles.groupTitle}>依頼条件</div>
          <div className={styles.fieldGrid}>
            <span className={styles.fieldLabel}>納入場所</span><select className={styles.selectLike} defaultValue="三日市工場"><option>三日市工場</option></select>
            <span className={styles.fieldLabel}>宛先</span><select className={styles.selectLike} defaultValue="生産調達課（物流）"><option>生産調達課（物流）</option></select>
            <span className={styles.fieldLabel}>支払条件1</span><select className={styles.selectLike} defaultValue="月末締切翌月末支払"><option>月末締切翌月末支払</option></select>
            <span className={styles.fieldLabel}>支払条件2</span><select className={styles.selectLike} defaultValue="現金"><option>現金</option></select>
            <span className={styles.fieldLabel}>納入条件</span><select className={styles.selectLike} defaultValue="車上渡し"><option>車上渡し</option></select>
          </div>
        </div>
        <div className={styles.checkBoxPanel}>
          <div className={styles.groupTitle}>検査区分</div>
          <div className={styles.checkGrid}>
            <label className={styles.checkboxLabel}><input type="checkbox" />自主検査</label>
            <label className={styles.checkboxLabel}><input type="checkbox" />弊社立会</label>
            <label className={styles.checkboxLabel}><input type="checkbox" />客先立会</label>
            <label className={styles.checkboxLabel}><input type="checkbox" />官庁検査</label>
            <label className={styles.checkboxLabel}><input type="checkbox" />納入後検査</label>
          </div>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table
          className={styles.estimateTable}
          style={{ minWidth: tableWidth, width: tableWidth }}
        >
          <colgroup>
            {estimateColumns.map((column) => (
              <col
                key={column.key}
                style={{ width: columnWidths[column.key] }}
              />
            ))}
          </colgroup>
          <thead>
            <tr>
              {estimateColumns.map((column) => (
                <th className={getCellClassName(column.key)} key={column.key}>
                  <span className={styles.headerLabel}>
                    {column.labelLines.join("\n")}
                  </span>
                  {column.resizable !== false ? (
                    <button
                      aria-label={`${column.labelLines.join("")}列幅を調整`}
                      className={styles.resizeHandle}
                      onPointerDown={(event) =>
                        handleColumnResizeStart(event, column)
                      }
                      type="button"
                    />
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const isSelected = selectedRowNos.has(row.rowNo);

              return (
                <tr className={isSelected ? styles.selected : undefined} key={row.rowNo}>
                  {estimateColumns.map((column) => (
                    <td className={getCellClassName(column.key)} key={column.key}>
                      {renderEstimateCell({
                        isReflected,
                        isSelected,
                        itemNameOptions,
                        materialOptions,
                        onCellChange: updateEditableCell,
                        onToggleSelectedRow: toggleSelectedRow,
                        processNameOptions,
                        row,
                        rowIndex,
                        columnKey: column.key,
                      })}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function getCellClassName(columnKey: EstimateColumnKey): string | undefined {
  if (columnKey === "rowNo") {
    return styles.rowNo;
  }

  if (
    columnKey === "dataTransfer" ||
    columnKey === "revision" ||
    columnKey === "inspectionNo" ||
    columnKey === "need"
  ) {
    return styles.center;
  }

  if (columnKey === "price" || columnKey === "quantity") {
    return styles.right;
  }

  return undefined;
}

function renderEstimateCell({
  columnKey,
  isReflected,
  isSelected,
  itemNameOptions,
  materialOptions,
  onCellChange,
  onToggleSelectedRow,
  processNameOptions,
  row,
  rowIndex,
}: {
  columnKey: EstimateColumnKey;
  isReflected: boolean;
  isSelected: boolean;
  itemNameOptions: string[];
  materialOptions: string[];
  onCellChange: (rowNo: number, field: EditableField, value: string) => void;
  onToggleSelectedRow: (rowNo: number) => void;
  processNameOptions: string[];
  row: ExistingEstimateRow;
  rowIndex: number;
}) {
  switch (columnKey) {
    case "rowNo":
      return rowIndex + 1;
    case "dataTransfer":
      return (
        <input
          checked={isSelected}
          onChange={() => onToggleSelectedRow(row.rowNo)}
          type="checkbox"
        />
      );
    case "orderNo":
      return row.orderNo;
    case "revision":
      return row.revision;
    case "orderSubNo":
      return row.orderSubNo;
    case "inspectionNo":
      return row.inspectionNo;
    case "processName":
      return (
        <CellSelect
          onChange={(value) => onCellChange(row.rowNo, "processName", value)}
          options={processNameOptions}
          value={row.processName}
        />
      );
    case "drawingNo":
      return row.drawingNo;
    case "itemName":
      return (
        <CellSelect
          onChange={(value) => onCellChange(row.rowNo, "itemName", value)}
          options={itemNameOptions}
          value={row.itemName}
        />
      );
    case "dimensions":
      return row.dimensions;
    case "material":
      return (
        <CellSelect
          onChange={(value) => onCellChange(row.rowNo, "material", value)}
          options={materialOptions}
          value={row.material}
        />
      );
    case "need":
      return row.need;
    case "quantity":
      return row.quantity;
    case "price":
      return isReflected
        ? formatEstimatePrice(calculateEstimatePrice(row))
        : "";
    case "dueDate":
      return row.dueDate;
    case "delivery":
      return row.delivery;
    case "requestDate":
    case "requestVendor":
    case "weight":
      return "";
  }
}

function CellSelect({
  onChange,
  options,
  value,
}: {
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  const selectOptions = options.includes(value) ? options : [value, ...options];

  return (
    <select
      className={styles.cellSelect}
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      {selectOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
