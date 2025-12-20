import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "./../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "./../components/Title";
import ProductItem from "./../components/ProductItem";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category)
      );
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case "low-high":
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;
      case "high-low":
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  return (
    <div className="flex flex-col gap-1 pt-10 border-t sm:flex-row sm:gap-10">
      {/* Filters */}
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 my-2 text-xl cursor-pointer"
        >
          FILTERS
          <img
            className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
            alt=""
          />
        </p>
        {/* Category filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                onChange={toggleCategory}
                value={"Frontal"}
              />{" "}
              Frontal
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                onChange={toggleCategory}
                value={"Closure"}
              />{" "}
              Closure
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                onChange={toggleCategory}
                value={"Straight"}
              />{" "}
              Straight Wig
            </p>
          </div>
        </div>
        {/* SubCategory Filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">TYPE</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <h5 className="font-bolld">Short Wigs</h5>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                onChange={toggleSubCategory}
                value="Pixie Cut"
              />
              Pixie Cut (4-6 inches)
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                onChange={toggleSubCategory}
                value="Bob"
              />
              Bob (6-8 inches)
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                onChange={toggleSubCategory}
                value="Short Bob"
              />
              Short Bob (8-10 inches)
            </p>
            <h5 className="font-bold">Medium Wigs</h5>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                onChange={toggleSubCategory}
                value="Shoulder-length"
              />
              Shoulder-length (10-12 inches)
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                onChange={toggleSubCategory}
                value="Chin-length"
              />
              Chin-length (12-14 inches)
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                onChange={toggleSubCategory}
                value="Mid-length"
              />
              Mid-length (14-16 inches)
            </p>
            <h5 className="font-bold">Long Wigs</h5>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                onChange={toggleSubCategory}
                value="Long Bob"
              />
              Long Bob (16-18 inches)
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                onChange={toggleSubCategory}
                value="Shoulder-grazing"
              />
              Shoulder-grazing (18-20 inches)
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                onChange={toggleSubCategory}
                value="Medium Long"
              />
              Medium Long (20-22 inches)
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                onChange={toggleSubCategory}
                value="Long"
              />
              Long (22-24 inches)
            </p>
            <h5 className="font-bold">Extra Long Wigs</h5>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                onChange={toggleSubCategory}
                value="Extra Long"
              />
              Extra Long (24-26 inches)
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                onChange={toggleSubCategory}
                value="Ultra Long"
              />
              Ultra Long (26-30 inches)
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                onChange={toggleSubCategory}
                value="Specialty"
              />
              Specialty (30-36 inches)
            </p>
              
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1">
        <div className="flex justify-between mb-4 text-base sm:text-2xl">
          <Title text1={"ALL"} text2={"WIGS"} />
          {/* Product sort */}
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="px-2 text-sm border-2 border-gray-300"
          >
            <option value="relevant">Sort by: Popular</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {/* Map Products */}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 gap-y-6">
          {filterProducts.map((item, index) => (
            <ProductItem
              key={index}
              id={item._id}
              image={item.image}
              name={item.name}
              price={item.price}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
