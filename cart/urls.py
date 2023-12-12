from django.urls import path

from . import views

urlpatterns = [
    path('cart/', views.cart, name="cart"),
    path('add_product_to_cart/<uuid:product_id>/<int:quantity>/', views.add_product_to_cart, name="add_product_to_cart"),
]
