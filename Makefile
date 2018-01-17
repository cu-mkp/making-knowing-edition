# use tabs for indentation!

SSH-USER = root
SSH-HOST = 159.203.130.30
REMOTE-PATH = /var/www/html/

deploy:
	rsync -cavze ssh --delete ./build/ $(SSH-USER)@$(SSH-HOST):$(REMOTE-PATH)

ssh:
	ssh $(SSH-USER)@$(SSH-HOST)
