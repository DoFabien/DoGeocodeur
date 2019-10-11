. deploy.config

echo $serverHost
echo $serverPort
echo $serverPath

ssh -p $serverPort $serverUser@$serverHost "
mkdir -p $serverPath
"

ng build --prod
cd ./dist

rsync -e "ssh -p $serverPort" -avz ./ $serverUser@$serverHost:$serverPath
