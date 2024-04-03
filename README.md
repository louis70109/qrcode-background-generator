# [幫 QR Code 加上背景圖，別只留下黑白！](https://nijialin.com/)

![](https://github.com/louis70109/qrcode-background-generator/blob/main/qrcode.png?raw=true)

- QR Code 相關參數請參考 [Awesome-qr.js](https://github.com/SumiMakito/Awesome-qr.js/blob/master/README.md)
- 建議以深色圖片為主，淺色實測不易掃描。

> ChatGPT 介紹: 
>
> 歡迎來到 QR code generator 的世界！如果您正在尋求一款充滿創意和實用性的 QR code 生成器，那麼您已經找到了正確的地方。
>
> 這款 QR code generator 不僅能夠生成具有背景圖片的 QR code，還給您更多設計選擇的空間，以增強您的商業或個人項目的曝光度和吸引力，同時提高用戶體驗。
>
> 此外，這款 QR code generator 還與 LINE Bot 進行了串接，使您在生成 QR code 的同時可以輕鬆通過 LINE Bot 向用戶發送訊息，實現互動。這是一項非常實用且高效的功能，可以使您的溝通更加順暢。
>
> 這個項目是免費的，易於使用，並且可以通過 GitHub 項目連結 https://github.com/louis70109/qrcode-background-generator 使用。它也是開源的，您可以查看程式碼，進行修改和改進，以滿足您的特殊需求。
>
> 因此，如果您正在尋求一款功能強大，易於使用，免費和開源的 QR code generator，那麼您不妨將其作為您的首選。歡迎您的引用，並開始您的 QR code 之旅！

## 操作流程

![流程圖](https://raw.githubusercontent.com/louis70109/qrcode-background-generator/main/user-flow.png)

## 如何開發測試

需填入 `.env` 檔案中的各種參數值，會自動連線 ngrok 並更換 LINE Bot webhook endpoint。

```
cd qrcode-background-generator/
mv .env.sample .env
npm install
npm run dev
```
## Fly.io deploy

如果你是 Mac:

```
brew install flyctl
fly auth login
fly launch
```

## License

MIT
