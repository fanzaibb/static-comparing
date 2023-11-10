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
}

function App() {
  const [items, setItems] = useState<Item[]>([]);

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
          return {
            ...item,
            newName: String(row["商品名稱"]),
            newCost: String(row["成本"]),
            newPrice: String(row["定價"]),
            newMarketPrice: String(row["參考市價(建議售價)"]),
          };
        }
        return item;
      });

      return updatedItems;
    });
  };
  return (
    <div className="App">
      <main className={styles.main}>
        <h1 className={styles.title}>今天要吃啥？</h1>
        <div className={styles.box}>
          <label htmlFor="item-file" className={styles.upload}>
            上傳商品清單
          </label>
          <input
            id="item-file"
            type="file"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={handleMomoUpload}
          ></input>
          <label htmlFor="momo-file" className={styles.upload}>
            上傳MOMO商品內容
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
              <thead>
                <tr>
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
                    <td>{item.id}</td>
                    <td>
                      {item.name}
                      {item.newName && item.name !== item.newName && (
                        <span style={{ color: "red" }}> ({item.newName})</span>
                      )}
                    </td>
                    <td>
                      {item.cost}
                      {item.newCost && item.cost !== item.newCost && (
                        <span style={{ color: "red" }}> ({item.newCost})</span>
                      )}
                    </td>
                    <td>
                      {item.price}
                      {item.newPrice && item.price !== item.newPrice && (
                        <span style={{ color: "red" }}> ({item.newPrice})</span>
                      )}
                    </td>
                    <td>
                      {item.marketPrice}
                      {item.newMarketPrice &&
                        item.marketPrice !== item.newMarketPrice && (
                          <span style={{ color: "red" }}>
                            {" "}
                            ({item.newMarketPrice})
                          </span>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
    </div>
  );
}

export default App;
