default: build

build: src/* 
	npx tsc

serve: 
	servez demo

clean:
	rm demo/*.js*

deploy:
	./deploy.sh
