import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useModal } from "../../context/Modal";
import { thunkCreatePost, thunkGetPosts} from "../../redux/postReducer";
import { useNavigate } from "react-router-dom";
// import { thunkGetComments } from "../../redux/commentReducer";
import { createImage } from "../../redux/imageReducer";
import { thunkGetTags } from "../../redux/tagReducer";
import './CreateBlogModal.css'

export default function CreateBlogModal() {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const userId = useSelector(state => state.session.user.id)

    const [text, setText] = useState("");
    // const [image, setImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    // const [isloaded, setIsloaded] = useState(false)
    const [errors, setErrors] = useState({});
    const { closeModal } = useModal();

    // tag
    const allTags = useSelector(state => state.tag)
    // console.log('all tag????', allTags)
    useEffect(() => {
        const func = async () => await dispatch(thunkGetTags())
        func()
        // console.log('does useeffect run??')
    }, [dispatch])

    const [selectedTags, setSelectedTags] = useState([]);
    const handleTagClick = (tagId) => {
        setSelectedTags(prevTags => {
            if (prevTags.includes(tagId)) {
                // Remove tag if it's already selected
                return prevTags.filter(tag => tag !== tagId);
            } else {
                // Add tag if it's not selected
                return [...prevTags, tagId];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log('file in handle submit', file)
        if (file) {
            // console.log('inside the file condition???')
            const handleSubmitImg = async (e) => {
                e.preventDefault();
                const formData = new FormData();
                formData.append("image", file);
                setImageLoading(true);
                const response = await dispatch(createImage(formData));
                // console.log('resonponse????', response)
                if (response) {
                    // console.log('inside respponse condition?')
                    const awsImageUrl = response?.image?.image;
                    setImageURL(awsImageUrl);  // Use the actual AWS URL here
                    // console.log('resones returned', response)
                    return response;
                }
                setImageLoading(false);
            }
            const imgRes = await handleSubmitImg(e)
            const imageInUse = imgRes?.succss?.image?.image;
            // console.log('image in use??', imageInUse)
            const serverResponse = await dispatch(
                thunkCreatePost({
                    user_id: userId,
                    text,
                    img: imageInUse,
                    tags: selectedTags
                })
            );
            if (!serverResponse?.errors) {
                // setIsloaded(!isloaded)
                closeModal();
                const newPostId = serverResponse.data.id;
                navigate('/home', { state: { newPostId } });
            } else {
                setErrors(serverResponse);
            }
        } else {
            const serverResponse = await dispatch(
                thunkCreatePost({
                    user_id: userId,
                    text,
                    tags: selectedTags
                })
            );
            if (!serverResponse?.errors) {
                closeModal();
                // console.log('server response', serverResponse)
                const newPostId = serverResponse.data.id;
                navigate('/home', { state: { newPostId } });
                // setIsloaded(!isloaded)
            } else {
                setErrors(serverResponse);
            }
        }

    };
    // ---------------aws------preview
    const maxFileError = "Selected image exceeds the maximum file size of 5Mb";
    const [optional, setOptional] = useState('')
    const [imageURL, setImageURL] = useState('')
    const [file, setFile] = useState('')
    const [filename, setFilename] = useState('')

    const fileWrap = (e) => {
        e.stopPropagation();

        const tempFile = e.target.files[0];

        // Check for max image size of 5Mb
        if (tempFile?.size > 5000000) {
            setFilename(maxFileError); // "Selected image exceeds the maximum file size of 5Mb"
            return
        }

        const newImageURL = URL.createObjectURL(tempFile); // Generate a local URL to render the image file inside of the <img> tag.
        setImageURL(newImageURL);
        setFile(tempFile);
        setFilename(tempFile.name);
        setOptional("");
    }
    // console.log('IMG', file)
    // --------------aws----posting
    // const handleSubmitImg = async (e) => {
    //     e.preventDefault();
    //     const formData = new FormData();
    //     formData.append("image", file);
    //     // console.log('IMG', image)
    //     // console.log('FORMDATA', formData)

    //     setImageLoading(true);
    //     const response = await dispatch(createImage(formData));
    //     // console.log('response', response)
    //     if (response) {
    //         // const data = await response.json();
    //         // console.log('data', data)
    //         const awsImageUrl = response?.image?.image;
    //         console.log('aws images real in creation!!!!!!!', awsImageUrl)
    //         setImageURL(awsImageUrl);  // Use the actual AWS URL here
    //     }
    //     // console.log(imageURL)
    //     setImageLoading(false);
    // }

    const stateImageUrl = useSelector(state => state.image?.img?.image?.image);

    //   console.log('FILE', file)
    //   console.log('imageURL', imageURL)

    return (
        <div id="container-create-blog-modal">
            <h2>Create Blog</h2>
            <br></br>
            <p style={{ color: 'grey', fontSize: "15px" }}>Upload image(optional)</p>
            <div className="file-inputs-container">
                <div><img src={imageURL} style={{ width: "150px" }} className="thumbnails"></img></div>
                <div className="file-inputs-filename" style={{ color: filename === maxFileError ? "red" : "#B7BBBF" }}>{filename}</div>
                <input type="file" accept="image/png, image/jpeg, image/jpg" id="post-image-input" onChange={fileWrap}></input>
                <div className="file-inputs-optional">{optional}</div>
                {/* <label htmlFor="post-image-input" className="file-input-labels">Choose File</label> */}
            </div>

            <br></br>

            {/* <p style={{ color: 'grey', fontSize: "15px" }}>Choose your profile image(optional)</p>
      {(imageLoading) && <img style={{ width: '20%' }} src={imageURL}></img>} */}
            <div >
                <form
                // onSubmit={handleSubmitImg}
                // encType="multipart/form-data"
                >
                    {/* <input
         style={{visibility:'hidden'}}
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        /> */}
                    {/* <button style={{border:'1px solid lightgrey', padding:'10px', borderRadius:'7px'}}type="submit"><h3 style={{color:'black'}}>Please Confirm Image</h3></button> */}
                </form>


                {errors.server && <p>{errors.server}</p>}
            </div>
            <br></br>

            <form id="container-create-blog-form"
                onSubmit={handleSubmit}
                encType="multipart/form-data"
            >
                <label>
                    <textarea
                        type="text"
                        value={text}
                        // onChange={(e) => setText(e.target.value)}
                        onChange={(e) => {
                            const value = e.target.value;
                            setText(value);

                            // Clear error if text is greater than 2 characters
                            if (value.length >= 2) {
                                setErrors((prevErrors) => ({
                                    ...prevErrors,
                                    errors: {
                                        ...prevErrors.errors,
                                        text: null, // Clear the text error
                                    },
                                }));
                            }
                        }}
                        placeholder="Go ahead, put anything..."
                        required
                    />
                </label>
                {errors?.errors?.text && <p style={{ color: 'red' }}>{errors.errors.text}</p>}
                <br></br>
                <br></br>
                <label style={{ color: 'grey' }}>
                    # Add tags to help people find your post
                </label>
                <div>
                    {allTags?.tag?.map(tag => (
                        <button
                            className="tag-button"
                            key={tag.id}
                            type="button"
                            onClick={() => handleTagClick(tag.id)}
                            style={{
                                backgroundColor: selectedTags.includes(tag.id) ? 'rgb(248, 172, 10)' : 'white',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                padding: '5px 10px',
                                margin: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            {tag.name}
                        </button>
                    ))}
                    {/* <button type="button" onClick={handleAddTag}>Add Tag</button> */}
                </div>
                {/* <div>
                    {tags.map((tag, index) => (
                        <span key={index} style={{ marginRight: '10px' }}>
                            {tag}
                            <button type="button" onClick={() => handleRemoveTag(tag)}>Remove</button>
                        </span>
                    ))}
                </div> */}
                {errors?.errors?.tags && <p style={{ color: 'red' }}>{errors?.errors?.tags}</p>}
                <br />
                <button className='create-blog-button' type="submit" style={{ border: 'none', padding: '10px', borderRadius: '7px', backgroundColor: 'rgba(254, 212, 4, 255)', fontWeight: 'bold', fontSize: 'large' }}>Create</button> {' '}
                {/* <button

                    onClick={() => {
                        setText('new blog')
                    }}
                >Demo Blog</button> */}
            </form>
        </div>
    );
}


