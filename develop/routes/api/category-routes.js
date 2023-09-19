//imports
const router = require('express').Router();
const { Category, Product } = require('../../models');

//get all by category, and include product
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

//get category by ID and include the product
router.get('/:id', async (req, res) => {
  try {
    const singleTag = await Category.findByPk(req.params.id, {
      include: [{ model: Product }]
    });
    //report error if no tag ID found
    if (!singleTag) {
      console.log(singleTag)
      res.status(404).json({ message: 'Not found.' });
      return;
    }
    res.status(200).json(singleTag);
  } catch (err) {
    res.status(500).json(err);
  }

});

//create new category
router.post('/', async (req, res) => {
  try {
    const newTag = await Category.create(req.body);
    res.status(200).json(newTag);
  } catch (err) {
    res.status(400).json(err);
  }

  // takes user input from insomnia where params state id is
  router.put('/:id', (req, res) => {
    Category.update(req.body, {
      where: {
        id: req.params.id,
      },
    })
      .then((product) => {
        if (req.body.tagIds && req.body.tagIds.length) {
//find all category, map's the response's id, filters it with the ID
          Category.findAll({
            where: { product_id: req.params.id }
          }).then((categoryTags) => {
            const categoryTagIds = categoryTags.map(({ tag_id }) => tag_id);
            const newCategoryTag = req.body.tagIds
              .filter((tag_id) => !categoryTagIds.includes(tag_id))
              .map((tag_id) => {
                return {
                  product_id: req.params.id,
                  tag_id,
                };
              });


            const categoryTagsRemove = categoryTags
              .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))

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

//delete by id
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

});

module.exports = router;
