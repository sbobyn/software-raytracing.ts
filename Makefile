default: build

build: src/* 
	npx tsc
	cp src/index.html build

clean:
	rm -rf build