"""
Extensões do modelo de dados: Chat, Fórum, CPF, Termos Legais
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from main import Base

# Modelo estendido de User (adicionar CPF e termos)
class UserExtended(Base):
    __tablename__ = "users_extended"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    cpf = Column(String(14), unique=True, index=True)  # Format: 000.000.000-00
    phone = Column(String(15))  # +55 (11) 99999-9999
    terms_accepted_at = Column(DateTime)
    terms_version = Column(String)
    last_ip = Column(String)

    user = relationship("User", backref="extended")

# Chat - Conversas
class ChatRoom(Base):
    __tablename__ = "chat_rooms"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    buyer_id = Column(Integer, ForeignKey("users.id"))
    seller_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    last_message_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    product = relationship("Product")
    buyer = relationship("User", foreign_keys=[buyer_id])
    seller = relationship("User", foreign_keys=[seller_id])
    messages = relationship("ChatMessage", back_populates="room")

# Chat - Mensagens
class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    message_type = Column(String)  # text, image, video
    content = Column(Text)  # Texto ou URL do arquivo
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    room = relationship("ChatRoom", back_populates="messages")
    sender = relationship("User")

# Fórum - Posts
class ForumPost(Base):
    __tablename__ = "forum_posts"
    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"))
    category = Column(String)  # discussao, duvida, dica, review, off-topic
    title = Column(String, index=True)
    content = Column(Text)
    images = Column(Text)  # JSON array de URLs
    likes_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    is_pinned = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author = relationship("User")
    comments = relationship("ForumComment", back_populates="post")
    likes = relationship("ForumLike", back_populates="post")

# Fórum - Comentários
class ForumComment(Base):
    __tablename__ = "forum_comments"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("forum_posts.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    parent_comment_id = Column(Integer, ForeignKey("forum_comments.id"), nullable=True)  # Para respostas
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("ForumPost", back_populates="comments")
    author = relationship("User")
    parent = relationship("ForumComment", remote_side=[id], backref="replies")

# Fórum - Likes
class ForumLike(Base):
    __tablename__ = "forum_likes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("forum_posts.id"), nullable=True)
    comment_id = Column(Integer, ForeignKey("forum_comments.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    post = relationship("ForumPost", back_populates="likes")

# Denúncias
class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"))
    reported_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    post_id = Column(Integer, ForeignKey("forum_posts.id"), nullable=True)
    reason = Column(String)  # fraude, falsificacao, conduta, spam
    description = Column(Text)
    status = Column(String, default="pending")  # pending, analyzing, resolved, dismissed
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    reporter = relationship("User", foreign_keys=[reporter_id])
    reported_user = relationship("User", foreign_keys=[reported_user_id])

# Notificações
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String)  # new_message, product_sold, comment_reply, like
    title = Column(String)
    message = Column(Text)
    link = Column(String)  # Deep link para abrir conteúdo
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
