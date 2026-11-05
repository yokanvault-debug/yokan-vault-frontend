import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { peso } from '../Utils/helpers'

const Carousel = ({ title, items = [], interval = 4000 }) => {
    const [index, setIndex] = useState(0)
    const [paused, setPaused] = useState(false)
    const navigate = useNavigate()
    const total = items.length

    const next = () => setIndex((index + 1) % total)
    const prev = () => setIndex((index - 1 + total) % total)

    // auto next (pauses while the mouse is over it)
    useEffect(() => {
        if (paused || !total) return
        const timer = setTimeout(next, interval)
        return () => clearTimeout(timer)
    }, [index, paused, total])

    // how far a card is from the center: 0 = center, -1 = left, 1 = right
    const getOffset = (i) => {
        let offset = i - index
        if (offset > total / 2) offset -= total
        if (offset < -total / 2) offset += total
        return offset
    }

    // nothing to show yet (the hooks above always run, so this early return is safe)
    if (!total) return null

    return (
        <section
            className="cc"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <h2>{title}</h2>

            <div className="cc__stage">
                {items.map((item, i) => {
                    const offset = getOffset(i)
                    let className = 'cc__card'
                    if (offset === 0) className += ' is-center'
                    if (Math.abs(offset) > 1) className += ' is-hidden'

                    return (
                        <div
                            key={item._id || i}
                            className={className}
                            style={{ '--o': offset }}
                            onClick={() => (offset === 0 && item._id ? navigate(`/product/${item._id}`) : setIndex(i))}
                        >
                            <img src={item.images && item.images[0] ? item.images[0].url : '/images/default-product.png'} alt={item.name} />
                            <p className="cc__name">{item.name}</p>
                            <p className="cc__price">{peso(item.price)}</p>
                            <p className="cc__rating">★ {Number(item.ratings || 0).toFixed(1)} · {item.numOfReviews || 0} review{item.numOfReviews === 1 ? '' : 's'}</p>
                        </div>
                    )
                })}

                <button className="cc__btn cc__btn--prev" onClick={prev} aria-label="Previous">‹</button>
                <button className="cc__btn cc__btn--next" onClick={next} aria-label="Next">›</button>
            </div>

            <div className="cc__dots">
                {items.map((item, i) => (
                    <button
                        key={item._id || i}
                        className={i === index ? 'is-active' : ''}
                        onClick={() => setIndex(i)}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    )
}

export default Carousel
