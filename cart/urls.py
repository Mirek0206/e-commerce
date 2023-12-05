from django.urls import path

from . import views

urlpatterns = [
    path('add_product/<uuid:product_id>/<int:quantity>/', views.add_product, name="add_product"),
]
