import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text } from 'react-native';
import Svg, { G, Path, LinearGradient, Stop, Defs } from 'react-native-svg';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import FusionMarketsLogo from './atoms/FusionMarketsLogo';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Icon parts assembly - using actual Fusion Markets icon paths, starting from scattered positions
  const part1X = useRef(new Animated.Value(-120)).current;
  const part1Y = useRef(new Animated.Value(-80)).current;
  const part1Opacity = useRef(new Animated.Value(0)).current;
  
  const part2X = useRef(new Animated.Value(140)).current;
  const part2Y = useRef(new Animated.Value(-60)).current;
  const part2Opacity = useRef(new Animated.Value(0)).current;
  
  const part3X = useRef(new Animated.Value(-110)).current;
  const part3Y = useRef(new Animated.Value(100)).current;
  const part3Opacity = useRef(new Animated.Value(0)).current;
  
  const part4X = useRef(new Animated.Value(150)).current;
  const part4Y = useRef(new Animated.Value(90)).current;
  const part4Opacity = useRef(new Animated.Value(0)).current;

  const AnimatedG = Animated.createAnimatedComponent(G);

  useEffect(() => {
    const startAnimation = () => {
      // Fade in container
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      // Show scattered parts first
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(part1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(part2Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(part3Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(part4Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
      }, 600);

      // Assemble icon parts to center with spring animation
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(part1X, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
          Animated.spring(part1Y, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
          Animated.spring(part2X, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
          Animated.spring(part2Y, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
          Animated.spring(part3X, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
          Animated.spring(part3Y, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
          Animated.spring(part4X, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
          Animated.spring(part4Y, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
        ]).start();
      }, 1200);

      // Scale and fade in complete logo while fading out parts
      setTimeout(() => {
        Animated.parallel([
          // Fade out individual parts
          Animated.timing(part1Opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(part2Opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(part3Opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(part4Opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
          // Fade in complete logo
          Animated.spring(logoScale, {
            toValue: 1,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2400);

      // Show text
      setTimeout(() => {
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }).start();
      }, 3200);

      // Complete animation
      setTimeout(() => {
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          onAnimationComplete();
        });
      }, 5000);
    };

    startAnimation();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <View style={styles.logoContainer}>
        {/* SVG Icon Assembly Animation - Using actual Fusion Markets icon parts */}
        <Svg width="400" height="200" viewBox="0 0 100 84" style={styles.svg}>
          <Defs>
            <LinearGradient id="grad1" x1="57.67%" y1="3.38%" x2="47.16%" y2="93.17%">
              <Stop offset="0%" stopColor="#5B17B7" />
              <Stop offset="32.66%" stopColor="#982BDC" />
              <Stop offset="100%" stopColor="#3922B4" />
            </LinearGradient>
            <LinearGradient id="grad2" x1="35.17%" y1="48.62%" x2="0%" y2="55.18%">
              <Stop offset="0%" stopColor="#B64AE3" />
              <Stop offset="100%" stopColor="#8F36D1" />
            </LinearGradient>
            <LinearGradient id="grad3" x1="50%" y1="44.19%" x2="23.99%" y2="60.73%">
              <Stop offset="0%" stopColor="#AB42DD" />
              <Stop offset="100%" stopColor="#8A33D1" />
            </LinearGradient>
            <LinearGradient id="grad4" x1="58.90%" y1="13.38%" x2="12.86%" y2="96.56%">
              <Stop offset="0%" stopColor="#8E36D9" />
              <Stop offset="100%" stopColor="#7229C9" />
            </LinearGradient>
          </Defs>
          
          {/* Fusion Markets Icon Parts - Assembling Animation */}
          
          {/* Part 1 - Main background shape */}
          <AnimatedG
            style={{
              opacity: part1Opacity,
              transform: [
                { translateX: part1X },
                { translateY: part1Y },
              ],
            }}
          >
            <Path
              d="M36.7245356,0.0973262032 C35.8937992,1.04064171 35.0555787,1.97647059 34.2472947,2.93475936 C33.6485657,3.63850267 32.9899639,4.28235294 32.4361397,5.02352941 C32.1741958,5.36791444 31.8299266,5.48770053 31.3958482,5.48770053 C25.0343533,5.4802139 18.6728584,5.4802139 12.3113636,5.4802139 C11.5629524,5.4802139 10.8070571,5.54759358 10.0885824,5.73475936 C8.8387358,6.05668449 7.75353962,6.67807487 6.90783501,7.71122995 C6.31659019,8.42245989 5.94986872,9.23101604 5.68792482,10.084492 C5.53075847,10.6010695 5.47836969,11.1475936 5.47088558,11.7090909 C5.30623512,19.6449198 5.44094913,27.573262 5.40352857,35.5090909 C5.40352857,35.8759358 5.32120335,36.1679144 5.05925944,36.4524064 C4.50543518,37.0588235 3.96657915,37.6727273 3.41275489,38.2791444 C2.70176429,39.0652406 1.55669521,40.3604278 0.853188722,41.1540107 C0.621181263,41.4160428 0.389173803,41.6705882 0.149682232,41.9326203 L2.84217094e-14,41.9326203 C2.84217094e-14,30.8524064 2.84217094e-14,19.7647059 2.84217094e-14,8.68449198 C2.84217094e-14,8.0631016 0.0898093392,7.45668449 0.261943906,6.85775401 C0.396657915,6.39358289 0.568792482,5.86203209 0.718474714,5.54010695 C1.2273943,4.44705882 3.13584276,1.42994652 7.40927048,0.29197861 C7.91819007,0.157219251 8.449562,0.0823529412 8.95848158,0.00748663102 L36.6796309,0.00748663102 C36.7020833,0.0449197861 36.7020833,0.0524064171 36.7245356,0.0973262032 Z"
              fill="url(#grad1)"
              transform="translate(25, 15)"
            />
          </AnimatedG>
          
          {/* Part 2 - Overlay gradient shape */}
          <AnimatedG
            style={{
              opacity: part2Opacity,
              transform: [
                { translateX: part2X },
                { translateY: part2Y },
              ],
            }}
          >
            <Path
              d="M36.7245356,0.0973262032 C35.8937992,1.04064171 35.0555787,1.97647059 34.2472947,2.93475936 C33.6485657,3.63850267 32.9899639,4.28235294 32.4361397,5.02352941 C32.1741958,5.36791444 31.8299266,5.48770053 31.3958482,5.48770053 C25.0343533,5.4802139 18.6728584,5.4802139 12.3113636,5.4802139 C11.5629524,5.4802139 10.8070571,5.54759358 10.0885824,5.73475936 C8.8387358,6.05668449 7.75353962,6.67807487 6.90783501,7.71122995 C6.31659019,8.42245989 5.94986872,9.23101604 5.68792482,10.084492 C5.53075847,10.5935829 3.48759601,1.68449198 11.4581749,0 L36.6796309,0 C36.7020833,0.0449197861 36.7020833,0.0524064171 36.7245356,0.0973262032 Z"
              fill="url(#grad2)"
              transform="translate(25, 15)"
            />
          </AnimatedG>
          
          {/* Part 3 - Middle geometric section */}
          <AnimatedG
            style={{
              opacity: part3Opacity,
              transform: [
                { translateX: part3X },
                { translateY: part3Y },
              ],
            }}
          >
            <Path
              d="M10.8818983,16.1262032 C10.7247319,15.9764706 10.7097637,15.7743316 10.7097637,15.5721925 C10.7097637,14.3743316 10.7097637,13.1764706 10.7097637,11.9786096 C10.7097637,11.9561497 10.7097637,11.9262032 10.7097637,11.9037433 C10.7696366,11.0278075 11.1064216,10.6983957 11.9895468,10.6983957 C16.7269894,10.6983957 21.4644321,10.6983957 26.2018747,10.6983957 C26.4263981,10.6983957 26.6658896,10.6684492 26.7856354,10.9304813 C26.9128653,11.2 26.8006036,11.4096257 26.6284691,11.6117647 C25.7977327,12.5625668 24.9669963,13.5058824 24.143744,14.4566845 C23.7845067,14.8684492 23.4177852,15.2802139 23.0435796,15.6770053 C22.7217628,16.0213904 22.3700096,16.2010695 21.8685741,16.1935829 C18.3884622,16.171123 14.9158344,16.1860963 11.4357225,16.1786096 C11.2561038,16.1860963 11.0615169,16.2160428 10.8818983,16.1262032 Z"
              fill="url(#grad3)"
              transform="translate(25, 15)"
            />
          </AnimatedG>
          
          {/* Part 4 - Bottom section */}
          <AnimatedG
            style={{
              opacity: part4Opacity,
              transform: [
                { translateX: part4X },
                { translateY: part4Y },
              ],
            }}
          >
            <Path
              d="M17.9693519,21.4117647 C16.8167988,22.7743316 16.0259776,23.7001783 15.5968886,24.1893048 C14.818541,25.0802139 14.0252251,25.9561497 13.2543616,26.8545455 C12.9774495,27.1764706 12.6481486,27.3935829 12.2440066,27.513369 C11.937158,27.6032086 10.7846048,27.7379679 10.7846048,26.397861 C10.7846048,25.1251141 10.7696366,23.859893 10.7846048,22.5871658 C10.7920889,22.1529412 11.3084926,21.4117647 12.2814271,21.4117647 C13.9728364,21.4117647 15.6717297,21.4117647 17.3631389,21.4117647 C17.4329906,21.4117647 17.6350616,21.4117647 17.9693519,21.4117647 Z"
              fill="url(#grad4)"
              transform="translate(25, 15)"
            />
          </AnimatedG>
        </Svg>

        {/* Complete logo that appears after assembly */}
        <Animated.View
          style={[
            styles.mainLogo,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <FusionMarketsLogo width={280} height={120} />
        </Animated.View>
      </View>

      <Animated.Text style={[styles.brandText, { opacity: textOpacity }]}>
        Fusion Markets
      </Animated.Text>
      
      <Animated.Text style={[styles.loadingText, { opacity: textOpacity }]}>
        Initializing your trading experience...
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
    width: 400,
    height: 200,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  mainLogo: {
    position: 'absolute',
    top: 40,
    left: 60,
  },
  brandText: {
    fontSize: 32,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
