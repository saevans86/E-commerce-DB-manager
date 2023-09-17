// import models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Products belongsTo Category
Product.hasOne(Category, {
  foreignKey: 'category_id',
  onDelete: 'CASCADE',
})

// Categories have many Products
Category.hasMany(Product, {
  foreignKey: 'id',
  onDelete: 'CASCADE'
})

// Products belongToMany Tags (through ProductTag)
Product.hasMany(ProductTag, {
  foreignKey: 'id',
  onDelete: 'CASCASE',

})
// Tags belongToMany Products (through ProductTag)
Tag.hasMany(ProductTag, {
  foreignKey: 'id',
  onDelete: 'CASCADE',
})



module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};

