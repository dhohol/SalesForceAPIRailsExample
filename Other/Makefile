PROJECT       = Wheatley
SIGN_KEY      = thisisakey
TABLET_PASS   = thisisakey
DEVICE_IP     = 10.172.69.101
BB_TABLET_DIR = '/Developer/SDKs/Research In Motion/BlackBerry WebWorks SDK for TabletOS 2.2.0.5/bbwp'

bb: clean
	find ./ -name *.DS_Store -type f -exec rm {} \;
	find ./ -name *.swp -type f -exec rm {} \;
	ruby bb-config.rb development increment
	zip -r ${PROJECT}.zip ./ 
	${BB_TABLET_DIR}/bbwp ./${PROJECT}.zip -d -g ${SIGN_KEY} -o ./
	rm ${PROJECT}.zip

release: clean
	find ./ -name *.DS_Store -type f -exec rm {} \;
	find ./ -name *.swp -type f -exec rm {} \;
	node r.js -o js/build.js
	ruby bb-config.rb release increment
	cp config.xml build/config.xml
	cp -r css build/css
	cp -r resources build/resources
	cp -r static build/static
	cd build; \
		zip -r ../build.zip ./
	${BB_TABLET_DIR}/bbwp ./build.zip -g ${SIGN_KEY} -o ./
	rm -r build.zip build/static build/css build/resources build/config.xml
	mv build.bar ${PROJECT}.bar

launch:
	${BB_TABLET_DIR}/blackberry-tablet-sdk/bin/blackberry-deploy -installApp -launchApp -password ${TABLET_PASS} -device ${DEVICE_IP} -package ./${PROJECT}.bar

clean:
	rm -rf build.zip build/static build/css build/resources build/config.xml
	rm -f ${PROJECT}.zip ./${PROJECT}.bar 

fix:
	@echo 'Warning: **********************************'
	@echo ' - As of WebWorks 2.2.0.5, camera_dispatcher file needs patching.'
	@echo ' - With later WebWorks versions, please build and try with the original file before running fix.'
	@echo ' - Backed up to camera_dispatcher.js.fix'
	@echo '*******************************************'
	cp -f ${BB_TABLET_DIR}/ext/blackberry.media.camera/js/common/camera_dispatcher.js ${BB_TABLET_DIR}/ext/blackberry.media.camera/js/common/camera_dispatcher.js.old
	cp -f camera_dispatcher.js.fix ${BB_TABLET_DIR}/ext/blackberry.media.camera/js/common/camera_dispatcher.js

