import { message } from "antd";

export function jsonImport<T = any>(): Promise<T> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const text = await file.text();
      const data = JSON.parse(text);

      resolve(data);

      message.success("导入成功");
    };

    input.click();
  });
}
