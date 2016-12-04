'use strict'

const Fs = require('fs');

const LocalConfig = require('../../_config.json');
const Logger = require('../../collections/logger');
const {
  YelpCategoryTree,
  CategoryList,
} = require('../../collections/yelp');

const _logger = new Logger("Scripts Yelp createCategoryLevels");


const createAllParentsFlat = (categoryList) => {
  const allParentsFlat = {};
  categoryList.forEach(category => {
    const parents = category.parents || [];

    parents.forEach(parent => {
      if (!allParentsFlat[parent]) allParentsFlat[parent] = [];
      allParentsFlat[parent].push(category.alias);
    });
  });

  return allParentsFlat;
};


const createCategoryTree = (categoryTree) => {
  const categoriesFound = [];

  for (let category in categoryTree) {
    for (let parent in categoryTree) {
      if (categoryTree[parent].indexOf(category) > -1) {
        categoriesFound.push({
          category: category,
          parent: parent,
        });
      }
    }
  }

  var index = categoriesFound.length;
  while (index--) {

    const indexParent = categoriesFound.findIndex(categoyObj => {
      if (categoriesFound[index].category == categoyObj.parent) {
        return true;
      }
    });

    if (indexParent > -1) {
      categoriesFound.splice(index, 1);
    }
  }

  categoriesFound.forEach(categoyObj => {
    const category = categoryTree[categoyObj.category];
    delete categoryTree[categoyObj.category];

    const indexToInsertInParent = categoryTree[categoyObj.parent].indexOf(categoyObj.category);
    categoryTree[categoyObj.parent][indexToInsertInParent] = {alias: categoyObj.category, children: category};
  });

  if (categoriesFound.length) {
    return createCategoryTree(categoryTree);
  } else {
    return categoryTree;
  }
};


const createTable = (categoryTree) => {

  YelpCategoryTree.recreateDBTable(() => {

    categoryTree.forEach(() => {

      const row = new CategoryTree();
      row.upsert();
    });
  });
};


const CreateCategoryLevels = () => {

  const allParentsFlat = createAllParentsFlat(CategoryList);
  const categoryTree = createCategoryTree(allParentsFlat);

  // console.log(categoryTree);

  Fs.writeFile('categoryTree.json', JSON.stringify(categoryTree, null, 4));
  createTable(categoryTree);
};


module.exports = CreateCategoryLevels;
