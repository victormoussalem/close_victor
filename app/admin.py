from app import app
from flask.ext.admin import Admin, BaseView, expose
from flask.ext.admin.contrib.sqla import ModelView

admin = Admin(app)

# Add your admin views here.
# admin.add_view(ModelView(Model, db.session, category="Category", name="Name"))
