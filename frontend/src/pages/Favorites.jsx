import { useEffect, useState } from "react";

import {
    Heart,
    Image as ImageIcon
} from "lucide-react";

import api from "../services/api";


function Favorites() {

    const [photos, setPhotos] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    const fetchFavorites = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "/api/photos/favorites"
            );

            if (response.data.success) {

                setPhotos(
                    response.data.photos || []
                );

            } else {

                setError(
                    response.data.message ||
                    "Unable to load favorites"
                );

            }

        } catch (error) {

            console.error(
                "FETCH FAVORITES ERROR:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load favorites"
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        fetchFavorites();

    }, []);


    return (

        <main className="gallery-page">

            <div className="gallery-container">

                <div className="gallery-header">

                    <div>

                        <p className="gallery-eyebrow">
                            Your collection
                        </p>

                        <h1>
                            Favorites
                        </h1>

                        <p className="gallery-description">
                            The memories you love the most.
                        </p>

                    </div>

                    <div className="favorites-heading-icon">
                        <Heart
                            size={24}
                            fill="currentColor"
                        />
                    </div>

                </div>


                {loading && (

                    <div className="photo-grid">

                        {Array.from({
                            length: 8
                        }).map((_, index) => (

                            <div
                                className="photo-skeleton"
                                key={index}
                            />

                        ))}

                    </div>

                )}


                {!loading &&
                    !error &&
                    photos.length === 0 && (

                    <div className="empty-state">

                        <div className="empty-icon">

                            <Heart size={28} />

                        </div>

                        <h2>
                            No favorites yet
                        </h2>

                        <p>
                            Tap the heart on a photo
                            to save your favorite memories.
                        </p>

                    </div>

                )}


                {!loading &&
                    photos.length > 0 && (

                    <div className="photo-grid">

                        {photos.map((photo) => (

                            <FavoritePhoto
                                key={photo._id}
                                photo={photo}
                                onRemove={fetchFavorites}
                            />

                        ))}

                    </div>

                )}

            </div>

        </main>
    );
}


function FavoritePhoto({
    photo,
    onRemove
}) {

    const [imageUrl, setImageUrl] =
        useState(null);


    const handleRemove = async () => {

        try {

            await api.patch(
                `/api/photos/${photo._id}/favorite`
            );

            onRemove();

        } catch (error) {

            console.error(
                "REMOVE FAVORITE ERROR:",
                error
            );

        }
    };


    useEffect(() => {

        let objectUrl = null;


        const loadImage = async () => {

            try {

                const response =
                    await api.get(
                        `/api/photos/${photo._id}/image`,
                        {
                            responseType: "blob"
                        }
                    );

                objectUrl =
                    URL.createObjectURL(
                        response.data
                    );

                setImageUrl(objectUrl);

            } catch (error) {

                console.error(
                    "IMAGE LOAD ERROR:",
                    error
                );

            }
        };


        loadImage();


        return () => {

            if (objectUrl) {

                URL.revokeObjectURL(
                    objectUrl
                );

            }

        };

    }, [photo._id]);


    return (

        <article className="photo-card">

            <div className="photo-image-wrapper">

                {imageUrl ? (

                    <img
                        src={imageUrl}
                        alt={
                            photo.title ||
                            photo.fileName
                        }
                        className="photo-image"
                    />

                ) : (

                    <div className="photo-loading">
                        <div className="image-spinner" />
                    </div>

                )}


                <button
                    className="favorite-button favorite-active"
                    onClick={handleRemove}
                    aria-label="Remove favorite"
                >

                    <Heart
                        size={19}
                        fill="currentColor"
                    />

                </button>

            </div>


            <div className="photo-info">

                <h3>
                    {photo.title ||
                        "Our Memory"}
                </h3>

                {photo.folder && (

                    <span>
                        {photo.folder.name}
                    </span>

                )}

            </div>

        </article>
    );
}


export default Favorites;