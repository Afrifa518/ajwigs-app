import React, { useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'sonner';

const Add = ({token}) => {


  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Frontal')
  const [subCategory, setSubCategory] = useState('Pixie Cut')
  const [bestseller, setBestseller] = useState(false)
  const [sizes, setSizes] = useState([])

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      
      const formData = new FormData();
      
      image1 && formData.append('image1', image1);
      image2 && formData.append('image2', image2);
      image3 && formData.append('image3', image3);
      image4 && formData.append('image4', image4);
      
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('bestseller', bestseller);
      formData.append('sizes', JSON.stringify(sizes));

      const response = await axios.post(backendUrl + "/api/product/add", formData, {headers: {token}})
      
      if (response.data.success) {
        toast.success(response.data.message);
        setName('');
        setDescription('');
        setPrice('');
        setCategory('Frontal');
        setSubCategory('Pixie Cut');
        setBestseller(false);
        setSizes([]);
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);       
      }else{
        toast.error(response.data.message);
      }
      

    } catch (error) {
      console.log(error);
      toast.error(error);
    }
  } 
  


  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-start w-full gap-3'>
        <div>
          <p className='mb-2'>Upload Image</p>

          <div className='flex gap-2'>
            <label htmlFor="image1">
              <img className='w-20' src={!image1 ? assets.upload_area: URL.createObjectURL(image1)} alt="" />
              <input onChange={(e) => setImage1(e.target.files[0])} type="file" id="image1" hidden/>
            </label>
            <label htmlFor="image2">
              <img className='w-20' src={!image2 ? assets.upload_area: URL.createObjectURL(image2)} alt="" />
              <input onChange={(e) => setImage2(e.target.files[0])} type="file" id="image2" hidden/>
            </label>
            <label htmlFor="image3">
              <img className='w-20' src={!image3 ? assets.upload_area: URL.createObjectURL(image3)} alt="" />
              <input onChange={(e) => setImage3(e.target.files[0])} type="file" id="image3" hidden/>
            </label>
            <label htmlFor="image4">
              <img className='w-20' src={!image4 ? assets.upload_area: URL.createObjectURL(image4)} alt="" />
              <input onChange={(e) => setImage4(e.target.files[0])} type="file" id="image4" hidden/>
            </label>
          </div>
        </div>

      <div className='w-full'>
        <p className='mb-2'>Wig Name</p>
        <input onChange={(e) => setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type here' required/>
      </div>
      
      <div className='w-full'>
        <p className='mb-2'>Wig Description</p>
        <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Write Description here' required/>
      </div>

      <div className='flex flex-col w-full gap-2 sm:flex-row sm:gap-8'>

        <div>
          <p className='mb-2'>Wig Category</p>
          <select onChange={(e) => setCategory(e.target.value)} className='w-full px-3 py-2'>
            <option value="Frontal">Frontal</option>
            <option value="Closure">Closure</option>
            <option value="Straight">Straight Wig</option>
          </select>
        </div>
        <div>
          <p className='mb-2'>Wig Length</p>
          <select onChange={(e) => setSubCategory(e.target.value)} className='w-full px-3 py-2'>
          <option value="">Select Wig Length</option>
            <optgroup label="Short Wigs">
              <option value="Pixie Cut">Pixie Cut (4-6 inches)</option>
              <option value="Bob">Bob (6-8 inches)</option>
              <option value="Short Bob">Short Bob (8-10 inches)</option>
            </optgroup>
            <optgroup label="Medium Wigs">
              <option value="Shoulder-length">Shoulder-length (10-12 inches)</option>
              <option value="Chin-length">Chin-length (12-14 inches)</option>
              <option value="Mid-length">Mid-length (14-16 inches)</option>
            </optgroup>
            <optgroup label="Long Wigs">
              <option value="Long Bob">Long Bob (16-18 inches)</option>
              <option value="Shoulder-grazing">Shoulder-grazing (18-20 inches)</option>
              <option value="Medium Long">Medium Long (20-22 inches)</option>
              <option value="Long">Long (22-24 inches)</option>
            </optgroup>
            <optgroup label="Extra Long Wigs">
              <option value="Extra Long">Extra Long (24-26 inches)</option>
              <option value="Ultra Long">Ultra Long (26-30 inches)</option>
              <option value="Specialty">Specialty (30-36 inches)</option>
            </optgroup>

          </select>
        </div>
        
        <div>
          <p className='mb-2'>Wig Price</p>
          <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='150' />
        </div>

      </div>

      <div>
  <p className='mb-2'>Wig Colors</p>
  <div className='flex gap-3'>
    <div onClick={() => setSizes(prev => prev.includes("Black") ? prev.filter(item => item !== "Black") : [...prev, "Black"])}>
      <p className={`px-3 py-1 mb-1 cursor-pointer ${sizes.includes("Black") ? 'bg-pink-100' : 'bg-slate-200'}`}>Black</p>
    </div>
    <div onClick={() => setSizes(prev => prev.includes("Brown") ? prev.filter(item => item !== "Brown") : [...prev, "Brown"])}>
      <p className={`px-3 py-1 mb-1 cursor-pointer ${sizes.includes("Brown") ? 'bg-pink-100' : 'bg-slate-200'}`}>Brown</p>
    </div>
    <div onClick={() => setSizes(prev => prev.includes("Red") ? prev.filter(item => item !== "Red") : [...prev, "Red"])}>
      <p className={`px-3 py-1 mb-1 cursor-pointer ${sizes.includes("Red") ? 'bg-pink-100' : 'bg-slate-200'}`}>Red</p>
    </div>
    <div onClick={() => setSizes(prev => prev.includes("White") ? prev.filter(item => item !== "White") : [...prev, "White"])}>
      <p className={`px-3 py-1 mb-1 cursor-pointer ${sizes.includes("White") ? 'bg-pink-100' : 'bg-slate-200'}`}>White</p>
    </div>
  </div>
</div>

    <div className='flex gap-2 mt-2'>
      <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id="bestseller" />
      <label className='cursor-pointer' htmlFor="bestseller">Add to Bestseller</label>
    </div>

    <button className='py-3 mt-4 text-white bg-black w-28' type='submit'>
      ADD
    </button>
    

        
    </form>
  )
}

export default Add