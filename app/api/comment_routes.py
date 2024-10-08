from flask import Blueprint, request,jsonify
from app.models import db, Comment, Post
from app.forms import CommentForm
from flask_login import login_required, current_user

comment_routes = Blueprint('comments', __name__)

# GET all comments
@comment_routes.route('/', methods=['GET'])
def comments():
    comments = Comment.query.all()
    if comments is None:
        return {'message':'Comment not found'}, 404
    return [comment.to_dict() for comment in comments], 200
# POST/GET comment by post id
@comment_routes.route('/<int:post_id>', methods=['GET','POST'])
def new_comment(post_id):
    if not current_user.is_authenticated:
            return {"error": "User not authenticated"}, 401
    post = Post.query.get(post_id)
    if post is None:
         return {'message':'Post not found'}, 404
    if request.method == 'GET':
          comments = Comment.query.filter_by(post_id=post_id).all()
          if comments is None:
                return {'message':'Comment not found'}, 404
          return [comment.to_dict() for comment in comments], 200
    form = CommentForm()
    form["csrf_token"].data = request.cookies["csrf_token"]

    if form.validate_on_submit():
         new_comment = Comment(
              text=form.data['text'],
              post_id=post_id,
              user_id=current_user.id
         )
         db.session.add(new_comment)
         db.session.commit()
         return new_comment.to_dict(), 201
    else:
            errors = {}
            for field, field_errors in form.errors.items():
                errors[field] = field_errors
            return jsonify(errors), 400

# PUT/DELETE comment by comment id
@comment_routes.route('/<int:comment_id>', methods=['PUT','DELETE'])
def comment(comment_id):
     if not current_user.is_authenticated:
            return {"error": "User not authenticated"}, 401
     comment = Comment.query.get(comment_id)
     if comment is None:
          return {'message':'Comment not found'}, 404
     if comment.user_id != current_user.id:
            return {"error": "Forbidden,you are not the owner of this comment"}, 403
     if request.method == 'PUT':
           form = CommentForm()
           form["csrf_token"].data = request.cookies["csrf_token"]
           data = request.json
           if form.validate_on_submit():
                 comment.text = data.get('text', comment.text)
                 db.session.commit()
                 return jsonify(comment.to_dict()),200
           return {'errors':form.errors}, 400
     elif request.method == 'DELETE':
           db.session.delete(comment)
           db.session.commit()
           return {'message':'Comment deleted'}, 200
     