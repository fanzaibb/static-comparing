import React, { useState, ChangeEvent } from "react";
import logo from "./logo.svg";
import "./App.css";
import styles from "./page.module.css";
import * as XLSX from "xlsx";

interface ExcelRow {
  ["商品編號"]: string;
  ["商品名稱"]: string;
  ["進價"]: string;
  ["售價(含稅)"]: string;
  ["市價"]: string;
  ["成本"]: string;
  ["定價"]: string;
  ["參考市價(建議售價)"]: string;
}

interface Item {
  id: string;
  name: string;
  cost: string;
  price: string;
  marketPrice: string;
  newName?: string;
  newCost?: string;
  newPrice?: string;
  newMarketPrice?: string;
  strikeName?: boolean;
  strikeCost?: boolean;
  strikePrice?: boolean;
  strikeMarketPrice?: boolean;
}

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [differencesCount, setDifferencesCount] = useState(0);

  const handleMomoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);

    // 假设你的工作表名为 "Sheet1"
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(
      worksheet
    ) as ExcelRow[];

    setItems(
      jsonData.map((row) => ({
        id: row["商品編號"],
        name: row["商品名稱"],
        cost: row["進價"],
        price: row["售價(含稅)"],
        marketPrice: row["市價"],
      }))
    );
  };
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    let differences = 0;
    const file = e.target.files![0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);

    // 假设你的工作表名为 "Sheet1"
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(
      worksheet
    ) as ExcelRow[];

    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        const row = jsonData.find(
          (row: any) => String(row["商品編號"]) === item.id
        );
        if (row) {
          const newItem = {
            ...item,
            newName: String(row["商品名稱"]),
            newCost: String(row["成本"]),
            newPrice: String(row["定價"]),
            newMarketPrice: String(row["參考市價(建議售價)"]),
          };
          if (newItem.name !== newItem.newName) differences++;
          if (newItem.cost !== newItem.newCost) differences++;
          if (newItem.price !== newItem.newPrice) differences++;
          if (newItem.marketPrice !== newItem.newMarketPrice) differences++;
          return newItem;
        }
        return item;
      });

      setDifferencesCount(differences);
      return updatedItems;
    });
  };

  const toggleStrike = (index: number, strikeField: keyof Item) => {
    const newItems = items.map((item, idx) => {
      if (idx === index) {
        return { ...item, [strikeField]: !item[strikeField] };
      }
      return item;
    });
    if (items[index][strikeField]) setDifferencesCount(differencesCount + 1);
    else setDifferencesCount(differencesCount - 1);
    setItems(newItems);
  };

  const renderCell = (
    item: Item,
    index: number,
    field: keyof Item,
    newField: keyof Item,
    strikeField: keyof Item
  ) => {
    const isDifferent =
      item[newField] && String(item[field]) !== String(item[newField]);
    return (
      <td
        style={{
          cursor: isDifferent ? "pointer" : "default",
          textDecoration: item[strikeField] ? "line-through" : "none",
        }}
        className={styles.cell}
        onClick={() => isDifferent && toggleStrike(index, strikeField)}
      >
        {item[field]}
        {isDifferent && (
          <span style={{ color: "red" }}> ({item[newField]})</span>
        )}
      </td>
    );
  };

  const handleCopyClick = (textToCopy: string) => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        console.log("文本已复制到剪贴板");
        // 可以在这里显示一些通知或反馈
      })
      .catch((err) => {
        console.error("复制文本时出错:", err);
      });
  };

  return (
    <div className="App">
      <main className={styles.main}>
        <h1 className={styles.title}>今天要吃啥？</h1>
        {differencesCount > 0 && (
          <span>
            還有
            <b style={{ fontSize: "20px", padding: "0 8px" }}>
              {differencesCount}
            </b>
            個改完就能吃飯惹～
          </span>
        )}
        <div className={styles.box}>
          <label htmlFor="item-file" className={styles.upload}>
            Step1: 上傳MOMO下載的商品內容
          </label>
          <input
            id="item-file"
            type="file"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={handleMomoUpload}
          ></input>
          <label htmlFor="momo-file" className={styles.upload}>
            Step2: 上傳商品清單
          </label>
          <input
            id="momo-file"
            type="file"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          ></input>
        </div>
        <div>
          {items.length > 0 && (
            <table className={styles.table}>
              <thead className={styles.stickyHeader}>
                <tr>
                  <th>No</th>
                  <th>編號</th>
                  <th>名稱</th>
                  <th>成本</th>
                  <th>售價</th>
                  <th>市價</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{index}</td>
                    <td
                      className={styles.copy}
                      onClick={() => handleCopyClick(item.id)}
                    >
                      {item.id}
                    </td>
                    {renderCell(item, index, "name", "newName", "strikeName")}
                    {renderCell(item, index, "cost", "newCost", "strikeCost")}
                    {renderCell(
                      item,
                      index,
                      "price",
                      "newPrice",
                      "strikePrice"
                    )}
                    {renderCell(
                      item,
                      index,
                      "marketPrice",
                      "newMarketPrice",
                      "strikeMarketPrice"
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
