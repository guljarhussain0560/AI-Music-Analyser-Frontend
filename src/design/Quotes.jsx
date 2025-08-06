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
            alignItems: 'center',
            height: '80px',
            width: '100%',
            maxWidth: '400px',
            gap: '4px',
        },
        waveBar: {
            width: '5px',
            backgroundColor: '#00bcd4',
            animationName: 'wave',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
        }
    };

    return (
        <div style={styles.waveContainer}>
            {[...Array(30)].map((_, i) => (
                <span key={i} style={{
                    ...styles.waveBar,
                    height: `${Math.random() * 5 + 5}px`, // Initial small height
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

    // This effect handles the word-by-word "electric shock" animation.
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
        quoteBox: {
            maxWidth: '900px',
            width: '100%',
            padding: '2rem 1rem',
            fontFamily: "'Roboto Mono', monospace",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
        },
        textContainer: {
            width: '100%',
            textAlign: 'center',
        },
        quoteText: {
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            fontWeight: 500,
            color: '#f0f0f0',
            lineHeight: '1.6',
            marginBottom: '1.5rem',
            minHeight: '140px',
            display: 'block',
        },
        artistText: {
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            fontWeight: '700',
            color: '#00bcd4',
            minHeight: '30px',
            display: 'block',
        },
        animations: `
            .electric-word {
                display: inline-block;
                opacity: 0;
                animation: thor-shock 0.9s ease-out forwards;
            }
            
            @keyframes thor-shock {
                0% {
                    opacity: 0;
                    transform: translateX(200px) skewX(-30deg);
                    filter: blur(5px);
                }
                40% {
                    opacity: 0.8;
                    transform: translateX(20px) skewX(20deg);
                    color: #fff;
                    text-shadow:
                        0 0 5px #fff,
                        0 0 15px #8effff,
                        0 0 30px #00e5ff,
                        0 0 50px #00e5ff;
                    filter: blur(2px);
                }
                45% {
                    transform: translateX(-100px) skewX(0deg);
                }
                50% {
                    transform: translateX(50px) skewX(-10deg);
                     text-shadow:
                        0 0 2px #fff,
                        0 0 8px #8effff,
                        0 0 15px #00e5ff;
                }
                55% {
                    transform: translateX(-20px) skewX(10deg);
                }
                70% {
                    transform: translateX(10px) skewX(-5deg);
                    color: #f0f0f0;
                    text-shadow: none;
                    filter: blur(0);
                }
                100% {
                    opacity: 1;
                    transform: translateX(0) skewX(0);
                }
            }

            @keyframes wave {
                0%, 100% { height: 5px; }
                50% { height: 60px; }
            }
        `,
    };
    
    return (
        <>
            <style>{styles.animations}</style>
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
        </>
    );
};

export default Quotes;
