from django.urls import path

from . import views

urlpatterns = [
    path("cart_get/", views.get_shopping_cart),
    path("cart_get/<uuid:cart_id>/", views.get_shopping_cart),
    path("cart_add_product/", views.cart_add_product),
    path("cart_subtract_product/", views.cart_subtract_product),
]
