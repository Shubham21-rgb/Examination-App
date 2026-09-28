class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS=True
class LocalDevelopmentConfig(Config):
    #configuration
    SQLALCHEMY_DATABASE_URI="sqlite:///examination.sqlite3"
    DEBUG=True

    #CONFIG FOR SEcUIRITY
    SECRET_KEY="This-is-a-secret-key"#helps to hash user credentials in session
    SECURITY_PASSWORD_HASH="bcrypt"#mechanism for hasing password
    SECURITY_PASSWORD_SALT="This-is-a-password-salt-key"#helps in hasing the password
    WTF_CSRF_ENABLED=False  #for production make it true related to form
    SECURITY_TOKEN_AUTHENTICATION_HEADER="Authentication-Token"   #used for the header when used in other apis

class ProductionDevelopmentConfig(Config):
    #configuration
    SQLALCHEMY_DATABASE_URI="sqlite:///examination.sqlite3"
    DEBUG=True

    #CONFIG FOR SECURITY
    SECRET_KEY="This-is-a-secret-key"#helps to hash user credentials in session
    SECURITY_PASSWORD_HASH="bcrypt"#mechanism for hasing password
    SECURITY_PASSWORD_SALT="This-is-a-password-salt-key"#helps in hasing the password
    WTF_CSRF_ENABLED=True#for production make it true related to form
    SECURITY_TOKEN_AUTHENTICATION_HEADER="Authentication-Token"