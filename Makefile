# use tabs for indentation!

SSH-USER = root
SSH-HOST = 159.203.130.30
REMOTE-PATH-STAGING = /var/www/staging
REMOTE-PATH-PROD = /var/www/prod

deploy-staging:
	rsync -cavze ssh --delete ./build/ $(SSH-USER)@$(SSH-HOST):$(REMOTE-PATH-STAGING)

deploy-prod:
	rsync -cavze ssh --delete ./build/ $(SSH-USER)@$(SSH-HOST):$(REMOTE-PATH-PROD)

ssh:
	ssh $(SSH-USER)@$(SSH-HOST)
