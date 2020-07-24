# Build Flow  
- imgと名前をつけたフォルダをzipする。
- assetsにimg.zipをuploadする。
- Tools -> Terminal
```
wget -O file.zip https://url-to-your-zip
unzip file.zip -d .
rm file.zip
mv img/* public/img/
rm -r img
refresh
```  
- Showする。

# Control 
- PullDownListからImgを選択する。  
- Keypointsが推論される。  
- Keypointsを動かす場合は、pointの領域内でクリックを押し、ドラックして移動させる。  
- キーボードで"a"を押すと、推論された状態に戻す。  
- キーボードで"z"を押すと、デフォルトで用意していた人型のKeypointsが反映される。  

# Save
- 別の画像を選択すると、自動でsaveされる。  
  (Listの最後の画像を保存する時は、別の画像を選択する。)  
- /data/dataset.json内に記録される。 


