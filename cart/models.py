import uuid

from django.db import models

# Create your models here.

class ShoppingCart(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, unique=True, editable=False)
    owner = models.ForeignKey('auth.User', on_delete=models.CASCADE, null=True)
    expiration_date = models.DateTimeField(null=True)

    def __str__(self):
        return f'Cart {self.id} with owner {self.owner}'


class CartEntry(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, unique=True, editable=False)
    cart = models.ForeignKey('ShoppingCart', on_delete=models.CASCADE)
    product = models.ForeignKey('shop.Product', on_delete=models.CASCADE)
    quantity = models.IntegerField()

    def __str__(self):
        return f'Entry {self.id} with {self.product} and quantity {self.quantity}'
