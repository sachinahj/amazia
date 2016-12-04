'use strict'

const Clone = require('clone');
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

    const indexToInsertInParent = categoryTree[categoyObj.parent].indexOf(categoyObj.category);
    categoryTree[categoyObj.parent][indexToInsertInParent] = {alias: categoyObj.category, children: category};
  });

  categoriesFound.forEach(categoyObj => {
    delete categoryTree[categoyObj.category];
  });

  if (categoriesFound.length) {
    return createCategoryTree(categoryTree);
  } else {
    return categoryTree;
  }
};


const convertToArray = (categoryTreeObj) => {
  const categoryTreeArray = [];
  for (let categoryTopLevel in categoryTreeObj) {
    categoryTreeArray.push({
      alias: categoryTopLevel,
      children: categoryTreeObj[categoryTopLevel],
    });
  }
  return categoryTreeArray;
}


const createTable = (categoryTreeArray) => {

  const recursiveFn = function (children, parentsInitial) {
    let categoryLevelInitial = 0;
    const rowRawInitial = {};
    parentsInitial.forEach(function (parent) {
      categoryLevelInitial += 1;
      rowRawInitial["aliasLevel" + categoryLevelInitial] = parent;
    });


    children.forEach(function (child) {
      const parents = parentsInitial.slice();
      const rowRaw = Clone(rowRawInitial);
      let categoryLevel = categoryLevelInitial;

      if (typeof child == "string") {
        while (categoryLevel < 5) {
          categoryLevel += 1;
          rowRaw["aliasLevel" + categoryLevel] = child;
        }
        const row = new YelpCategoryTree(rowRaw);
        console.log("upserting", row);
        row.upsert((err, results) => {
          console.log("done");
        });
      } else {
        parents.push(child.alias);
        recursiveFn(child.children, parents);
      }
    });
  };


  YelpCategoryTree.recreateDBTable(() => {

    categoryTreeArray.forEach(categoryLevel1Obj => {

      const row = new YelpCategoryTree({
        aliasLevel1: categoryLevel1Obj.alias,
        aliasLevel2: categoryLevel1Obj.alias,
        aliasLevel3: categoryLevel1Obj.alias,
        aliasLevel4: categoryLevel1Obj.alias,
      });

      console.log("upserting", row);
      row.upsert((err, results) => {
        console.log("done");
      });

      recursiveFn(categoryLevel1Obj.children, [categoryLevel1Obj.alias]);
    });

  });
};


const CreateCategoryLevels = () => {

  const allParentsFlat = createAllParentsFlat(CategoryList);
  // Fs.writeFile('allParentsFlat.json', JSON.stringify(allParentsFlat, null, 4));

  const categoryTree = createCategoryTree(allParentsFlat);
  // Fs.writeFile('categoryTree.json', JSON.stringify(categoryTree, null, 4));

  const categoryTreeArray = convertToArray(categoryTree);
  // Fs.writeFile('categoryTreeArray.json', JSON.stringify(categoryTreeArray, null, 4));
  createTable(categoryTreeArray);
};


module.exports = CreateCategoryLevels;
