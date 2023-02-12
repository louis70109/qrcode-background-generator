# [幫 QR Code 加上背景圖，別只留下黑白！](https://nijialin.com/)

![](https://github.com/louis70109/qrcode-background-generator/blob/main/qrcode.png?raw=true)

- QR Code 相關參數請參考 [Awesome-qr.js](https://github.com/SumiMakito/Awesome-qr.js/blob/master/README.md)
- 建議以深色圖片為主，淺色實測不易掃描。

## 如何開發測試

需填入 `.env` 檔案中的各種參數值，會自動連線 ngrok 並更換 LINE Bot webhook endpoint。

```
cd qrcode-background-generator/
mv .env.sample .env
npm install
npm run dev
```

## License

MIT
