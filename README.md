# Build Flow  
- assetsにImgをuploadする。  
- なるべく画像サイズを小さくしておく。  
- Tools -> Terminal -> "refresh"と入力する。  
- ターミナル操作はChromeの方が良さそう？  
- Showする。
- Imgのアップロードはgithubやzipfileを使うと、大量にアップロード可能 [参考](https://support.glitch.com/t/uploading-a-whole-folder/3128/4)
- その場合は、ターミナルからimg以下にファイルを配置すること。

# Control 
- PullDownListからImgを選択する。  
- Keypointsが推論される。  
- Keypointsを動かす場合は、pointの領域内でクリックを押し、ドラックして移動させる。  
- キーボードで"a"を押すと、推論された状態に戻す。  
- キーボードで"z"を押すと、デフォルトで用意していた人型のKeypointsが反映される。  

# Save
- 別の画像を選択すると、自動でsaveされる。(Listの最後の画像を保存する時は、別の画像を選択する。)  
- /data/dataset.json内に記録される。  

# ToDo
- assetsへのuploadが画像一枚ずつしか行えない。  
- ~~dataset.jsonが初期化されてしまうバグがある。~~  
- 途中でkeypointsを移動させた時、推論のKeypoints(推論の初期値)がうまく反映されない。  
- Keypoints同士が重なった時の対処法。  

~~ターミナルからzipにしてファイルあげたり、gitからimportすると、/public以下にimageおけるようになるっぽい。
ただそうすると、assetsの中に入らないから、doGet("/assets/all")とかdoGet("/assets/u/img.jpg")が通らなくなるな
サーバーとフロント書き換えればいけるけど
doGet("/all/foldername"), doGet("/u/foldername/filename")とかに~~

