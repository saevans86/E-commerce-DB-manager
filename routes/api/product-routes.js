// pull models
const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');
//get all products
router.get('/', async (req, res) => {
  try {
    const getAllCategories = await Product.findAll({
      include: [{ model: Category }, {model: Tag}]
    })
    res.status(200).json(getAllCategories);
  } catch (err) {
    res.status(500).json(err);
  }

});

//get one product
router.get('/:id', async(req, res) => {
  try {
    const getProduct = await Product.findByPk(req.params.id)
    if (!getProduct) {
      res.status(404).json({ message: 'Not Found.' })
      return;
    }
    res.status(200).json(getProduct)
  } catch (err) {
    res.status(500).json(err)
  }

});

//create product
router.post('/',  (req, res) => {


  Product.create(req.body)
    .then((product) => {

      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }

      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

//update product
router.put('/:id', (req, res) => {

  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {

          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.product_id,
              tag_id,
            };
          });


          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
           
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {

      res.status(400).json(err);
    });
});

//delete
router.delete('/:id', async (req, res) => {
  try {
    const deleteID = await Product.destroy({
      where: { id: req.params.id }
    })
    if (!deleteID) {
      res.status(404).json({ message: 'No product found with this ID' })
      return;
    }
    res.status(200).json(deleteID);
  } catch (err) {
    res.status(500).json(err);
  }


});

module.exports = router;
