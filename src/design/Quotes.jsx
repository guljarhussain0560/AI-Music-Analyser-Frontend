import React, { useState, useEffect, useCallback, useRef } from 'react';
// Directly import the JSON data.
// Make sure 'quotes.json' is in the same directory (or update the path).
import quoteData from './quotes.json';

// Component for the new musical wave visualizer.
const MusicWave = () => {
    const styles = {
        waveContainer: {
            display: 'flex',
            justifyContent: 'center',
            // Align bars to the bottom to scale upwards
            alignItems: 'flex-end',
            height: '80px',
            width: '100%',
            maxWidth: '400px',
            gap: '4px',
        },
        waveBar: {
            width: '5px',
            height: '100%', // Set a max height
            backgroundColor: '#00bcd4',
            animationName: 'wave',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
            // Set the origin for scaling to the bottom
            transformOrigin: 'bottom',
        }
    };

    return (
        <div style={styles.waveContainer}>
            {[...Array(30)].map((_, i) => (
                <span key={i} style={{
                    ...styles.waveBar,
                    animationDuration: `${Math.random() * (1 - 0.3) + 0.8}s`,
                    animationDelay: `${Math.random() * 1}s`,
                }}></span>
            ))}
        </div>
    );
};

// Main component to display the animated quote and visual.
const Quotes = () => {
    // The quotes are now directly available from the imported JSON.
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(
        // Set an initial random quote index on component load.
        Math.floor(Math.random() * quoteData.quotes.length)
    );
    // These states will now hold arrays of words, not characters.
    const [typedQuote, setTypedQuote] = useState([]);
    const [typedArtist, setTypedArtist] = useState([]);
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null); // Ref to hold the animation timeouts

    // This function selects a new random quote.
    const getNewQuote = useCallback(() => {
        setCurrentQuoteIndex(prevIndex => {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * quoteData.quotes.length);
            } while (newIndex === prevIndex);
            return newIndex;
        });
    }, []); // Empty dependency array as quoteData is static.

    // This effect sets up the interval to change quotes every 20 seconds.
    useEffect(() => {
        intervalRef.current = setInterval(getNewQuote, 20000);
        // Cleanup interval on component unmount.
        return () => clearInterval(intervalRef.current);
    }, [getNewQuote]);

    // This effect handles the word-by-word animation.
    useEffect(() => {
        // Clear any ongoing animation timeouts from the previous quote
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        const quote = `"${quoteData.quotes[currentQuoteIndex].quote}"`;
        const artist = `- ${quoteData.quotes[currentQuoteIndex].artist}`;
        
        const quoteWords = quote.split(' ');
        const artistWords = artist.split(' ');

        setTypedQuote([]);
        setTypedArtist([]);

        let quoteWordIndex = 0;
        let artistWordIndex = 0;

        // Recursive function to display words one by one
        const typeWord = () => {
            if (quoteWordIndex < quoteWords.length) {
                setTypedQuote(prev => [...prev, quoteWords[quoteWordIndex]]);
                quoteWordIndex++;
                timeoutRef.current = setTimeout(typeWord, 150); // Delay between words
            } else if (artistWordIndex < artistWords.length) {
                setTypedArtist(prev => [...prev, artistWords[artistWordIndex]]);
                artistWordIndex++;
                timeoutRef.current = setTimeout(typeWord, 120); // Faster for the artist name
            }
        };
        
        typeWord();

        // Cleanup timeouts on re-run
        return () => clearTimeout(timeoutRef.current);

    }, [currentQuoteIndex]); // Re-run animation when the quote index changes.

    // This function renders the text with the word-by-word animation effect.
    const renderTextWithAnimation = (wordsArray) => {
        return wordsArray.map((word, index) => (
            <span key={index} className="electric-word">
                {word}{'\u00A0'}
            </span>
        ));
    };

    const styles = {
        // This style is now just for the inner flex container
        quoteBox: {
            width: '100%',
            fontFamily: "'Roboto Mono', monospace",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
        },
        textContainer: {
            width: '100%',
            textAlign: 'center',
            height: '200px',
        },
        quoteText: {
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            fontWeight: 500,
            color: '#f0f0f0',
            lineHeight: '1.6',
            marginBottom: '1.5rem',
            display: 'block',
        },
        artistText: {
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            fontWeight: '700',
            color: '#00bcd4',
            display: 'block',
        },
        animations: `
            /* --- Responsive Container Styles --- */
            /* Mobile First: Solid Card Design */
            .quote-container {
                width: 90%;
                max-width: 500px;
                margin: 2rem auto;
                padding: 1.5rem;

                border-radius: 16px;

                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                transition: all 0.3s ease-in-out;
            }

            /* Desktop: Glassmorphism Design */
            @media (min-width: 768px) {
                .quote-container {
                    max-width: 900px;
                    padding: 2.5rem;


                    -webkit-backdrop-filter: blur(10px);
                    border-radius: 20px;

                }
            }
            
            /* --- Animation Styles --- */
            .electric-word {
                display: inline-block;
                opacity: 0;
                animation: thor-shock 0.8s ease-out forwards;
            }
            
            @keyframes thor-shock {
                0% {
                    opacity: 0;
                    transform: translateX(50px) skewX(-20deg);
                    filter: blur(4px);
                }
                50% {
                    opacity: 0.8;
                    transform: translateX(-10px) skewX(10deg);
                    color: #fff;
                    text-shadow:
                        0 0 5px #fff,
                        0 0 15px #8effff,
                        0 0 30px #00e5ff;
                    filter: blur(1px);
                }
                100% {
                    opacity: 1;
                    transform: translateX(0) skewX(0);
                    color: inherit;
                    text-shadow: none;
                    filter: blur(0);
                }
            }

            @keyframes wave {
                0%, 100% { transform: scaleY(0.1); }
                50% { transform: scaleY(1.0); }
            }
        `,
    };
    
    return (
        <>
            <style>{styles.animations}</style>
            {/* The new responsive container */}
            <div className="quote-container">
                <div id="quote-box" style={styles.quoteBox}>
                    <div style={styles.textContainer}>
                        <blockquote id="text" style={styles.quoteText}>
                            {renderTextWithAnimation(typedQuote)}
                        </blockquote>
                        <figcaption id="author" style={styles.artistText}>
                            {renderTextWithAnimation(typedArtist)}
                        </figcaption>
                    </div>
                    <MusicWave />
                </div>
            </div>
        </>
    );
};

export default Quotes;
