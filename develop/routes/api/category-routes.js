const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  try {
    const getAllCategories = await Category.findAll({
      include: [{ model: Product }], 
    })
    res.status(200).json(getAllCategories);
  } catch (err) {
    res.status(500).json(err);
}
  // find all categories
  // be sure to include its associated Products
});

router.get('/:id', async (req, res) => {
  try {
    const singleTag = await Category.findByPk(req.params.id);
    if (!singleTag) {
      res.status(404).json({ message: 'Not found.' });
      return;
    }
    res.status(200).json(singleTag);
  } catch (err) {
    res.status(500).json(err);
  }
  // find one category by its `id` value
  // be sure to include its associated Products
});

router.post('/', async (req, res) => {
  try {
    const newTag = await Category.create(req.body);
    res.status(200).json(newTag);
  } catch (err) {
    res.status(400).json(err);
  }
  // create a new category
});

router.put('/:id', (req, res) => {
  Category.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {

        Category.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            .map((tag_id) => {
              return {
                product_id: req.params.id,
                tag_id,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            Category.destroy({ where: { id: productTagsToRemove } }),
            Category.bulkCreate(newProductTags),
          ]);
        });
      }
      // update a tag's name by its `id` value
      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
  // update a category by its `id` value
});

router.delete('/:id', async (req, res) => {
  try {
    const deleteID = await Category.destroy({
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
  // delete a category by its `id` value
});

module.exports = router;
