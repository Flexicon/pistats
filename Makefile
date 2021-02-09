app_name	=pistats
dist		=linux_arm
bin_name	=$(app_name)_$(dist)

build:
	env GOOS=linux GOARCH=arm go build -o ./bin/$(bin_name) .

deploy_api:
	make build
	ssh raspberrypi "sudo systemctl stop $(app_name)"
	scp ./bin/$(bin_name) raspberrypi:/usr/local/bin/$(app_name)
	ssh raspberrypi "sudo systemctl restart $(app_name)"

deploy_front:
	scp -r ./frontend/* raspberrypi:/var/www/html

deploy:
	make deploy_api
	make deploy_front
