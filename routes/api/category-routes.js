//pull models
const router = require('express').Router();
const { Category, Product } = require('../../models');


//get all categories
router.get('/', async (req, res) => {
  try {
    const getAllCategories = await Category.findAll({
      include: [{ model: Product }],
    })
    res.status(200).json(getAllCategories);
  } catch (err) {
    res.status(500).json(err);
  }

});

// get one category by ID
router.get('/:id', async (req, res) => {
  try {
    const singleCategory = await Category.findByPk(req.params.id, {
      include: [{ model: Product }]
    });
   
    if (!singleCategory) {
      console.log(singleCategory)
      res.status(404).json({ message: 'Not found.' });
      return;
    }
    res.status(200).json(singleCategory);
  } catch (err) {
    res.status(500).json(err);
  }

});


//creates a new category
router.post('/', async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    res.status(200).json(newCategory);
  } catch (err) {
    res.status(400).json(err);
  }
  // updates new category
  router.put('/:id', (req, res) => {
    Category.update(req.body, {
      where: {
        id: req.params.id,
      },
    })
      .then((product) => {
        if (req.body.catIds && req.body.catIds.length) {

          Category.findAll({
            where: { product_id: req.params.id }
          }).then((categoryTags) => {
            const categorycatIds = categoryTags.map(({ tag_id }) => tag_id);
            const newCategoryTag = req.body.catIds
              .filter((tag_id) => !categorycatIds.includes(tag_id))
              .map((tag_id) => {
                return {
                  product_id: req.params.id,
                  tag_id,
                };
              });


            const categoryTagsRemove = categoryTags
              .filter(({ tag_id }) => !req.body.catIds.includes(tag_id))

            return Promise.all([
              Category.destroy({ where: { id: categoryTagsRemove } }),
              Category.bulkCreate(newCategoryTag),
            ]);
          });
        }

        return res.json(product);
      })
      .catch((err) => {

        res.status(400).json(err);
      });

  });
});


//delete category
router.delete('/:id', async (req, res) => {
  try {
    const deleteCatbyId = await Category.destroy({
      where: { id: req.params.id }
    })
    if (!deleteCatbyId) {
      res.status(404).json({ message: 'No product found with this ID' })
      return;
    }
    res.status(200).json(deleteCatbyId);
  } catch (err) {
    res.status(500).json(err);
  }

});

module.exports = router;
