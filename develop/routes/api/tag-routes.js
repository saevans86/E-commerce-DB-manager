
const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');


router.get('/', async (req, res) => {
  try {
    const findAllTags = await Tag.findAll({
      include: [{ model: Product }],
    })
  
    res.status(200).json(findAllTags);
  } catch (err) {
    res.status(500).json(err);
  }

});

router.get('/:id', async (req, res) => {
  try {
    const singleTag = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }]
    });

    if (!singleTag) {
      res.status(404).json({ message: 'Not found.' });
      return;
    }
    res.status(200).json(singleTag);
  } catch (err) {
    res.status(500).json(err);
  }

});

router.post('/', async (req, res) => {
  try {
    const newTag = await Tag.create(req.body);
    res.status(200).json(newTag);
  } catch (err) {
    res.status(400).json(err);
  }

});

router.put('/:id', (req, res) => {
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {

        Product.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          const productTagIds = productTags.map(({ tag_name }) => tag_name);
          const newProductTags = req.body.tagIds
            .filter((tag_name) => !productTagIds.includes(tag_name))
            .map((tag_name) => {
              return {
                product_id: req.params.id,
                tag_name,
              };
            });


          const productTagsToRemove = productTags
            .filter(({ tag_name }) => !req.body.tagIds.includes(tag_name))
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


router.delete('/:id', async (req, res) => {
  try {
    const deleteID = await Tag.destroy({
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
