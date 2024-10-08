from flask_wtf import FlaskForm
from wtforms import StringField,EmailField,FileField
from wtforms.validators import DataRequired, Email, ValidationError,Length
from app.models import User


def user_exists(form, field):
    # Checking if user exists
    email = field.data
    user = User.query.filter(User.email == email).first()
    if user:
        raise ValidationError('Email address is already in use.')


def username_exists(form, field):
    # Checking if username is already in use
    username = field.data
    user = User.query.filter(User.username == username).first()
    if user:
        raise ValidationError('Username is already in use.')


class SignUpForm(FlaskForm):
    profileImage = FileField('profileImage')
    username = StringField(
        "username", validators=[DataRequired(message="Please enter a username."), username_exists, Length(min=2, max=50, message="Username must be between 2 and 50 characters long.")]
    )
    email = EmailField(
        "email",
        validators=[DataRequired(message="Please enter your email address."), Email(), user_exists, Length(min=5, max=50, message="Length must be between 5 and 50.")],
    )
    password = StringField("password", validators=[DataRequired(message="Please enter a password."),Length(min=2, max=50, message="Password must be between 2 and 50 characters long.") ])
