

//Targets android API: 28.

//IMPORTANT: If running from localhost must request temporary use of CORS Anywhere proxy go to https://cors-anywhere.herokuapp.com/corsdemo
//IMPORTANT: If not running from localhost, delete CORS anywhere proxy from API calls.
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
//Normal react native version
//import LinearGradient from 'react-native-linear-gradient';
//Expo version
import LinearGradient from 'expo-linear-gradient';
import React, {useCallback, useState, useEffect} from 'react';
import { Video, AVPlaybackStatus } from 'expo-av';


import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Button,
  TouchableHighlight,
  //Could be better than ScrollView, only renders contents when its on-screen.
  FlatList,
  ActivityIndicator,
} from 'react-native';

//Header component.
function Header(): JSX.Element {
  return (
    <View style={styles.header}>
      <Image style={styles.logo} source={require('./logo.png')} />
      <Text style={styles.headerText}>React Native Tech Demo</Text>
    </View>
  );
}

//Tile component. Show image and title of the movie / show.
function Tile({title, image, navigation, brand}): JSX.Element {
  //Not sure how to set focus onto compnents inside a ScrollView - investigate.
  const [focus, setFocus] = useState(false);

  const onFocus = useCallback(() => {
    setFocus(true);
  }, [title]);

  const onBlur = useCallback(() => {
    setFocus(false);
  }, []);

  const onPress = () => {
    setFocus(true);
    navigation.navigate('Brand', {itemId: 1, websafeTitle: brand.websafeTitle})
  };

  return (
    //Change highlight tile by changing its styling when its in focus.
    //WHEN API WORKING source={image} needs to be replaced with source={uri: image}
    //Need to work out how focusing works.
    <TouchableHighlight
      onFocus={onFocus}
      onBlur={onBlur}
      style={[styles.wrapper, focus ? styles.wrapperFocused : null]}
      onPressIn={onPress}>
      <View style={styles.tileContainer}>
        <Image
          style={styles.image}
          source={{
            uri: image,
          }}
        />
        <Text style={styles.text}>{title}</Text>
      </View>
    </TouchableHighlight>
  );
}

/*
//Temporary hardcoded slice until my enviroment can connect to internet :( See Slice1 for API implementation.
function Slice(): JSX.Element {
  return (
    <View style={{height: 'auto'}}>
      <Text style={styles.sliceTitle}>This is a demo slice</Text>
      <ScrollView style={styles.scrollView} horizontal={true}>
        <Tile
          image={require('./inbetweeners.jpg')}
          title={'The Inbetweeners'}
        />
        <Tile image={require('./itcrowd.jpg')} title={'The IT Crowd'} />
        <Tile
          image={require('./inbetweeners.jpg')}
          title={'The Inbetweeners'}
        />
        <Tile image={require('./itcrowd.jpg')} title={'The IT Crowd'} />
        <Tile
          image={require('./inbetweeners.jpg')}
          title={'The Inbetweeners'}
        />
        <Tile image={require('./itcrowd.jpg')} title={'The IT Crowd'} />
        <Tile
          image={require('./inbetweeners.jpg')}
          title={'The Inbetweeners'}
        />
      </ScrollView>
    </View>
  );
}

 */

// SLICE FOR WHEN EMULATOR CAN CONNECT TO INTERNET, AND CALL API
function Slice({sliceTitle, items, navigation}): JSX.Element {
  return (
    <View style={{height: 'auto'}}>
      <Text style={styles.sliceTitle}>{sliceTitle}</Text>
      <ScrollView style={styles.scrollView} horizontal={true}>
        {items.map(item => ( 
          <Tile title={item.title} image={item.image.href} brand={item.brand} navigation={navigation}/>
        ))}
      </ScrollView>
    </View>
  );
}

//App component.
function Home({navigation}): JSX.Element {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  //Get all 'Slices' that are currently on Channel 4 homepage.
  const getSlices = async () => {
    try {
      const response = await fetch('https://cors-anywhere.herokuapp.com/https://www.channel4.com/api/homepage', {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        },
      });
      const json = await response.json();
      console.log(json);
      setData(json.slices);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  //Get slices on render.
  useEffect(() => {
    getSlices();
  }, []);

  //Add below line of code within scrollContainer when emulator is able to call API. Remove the hardcoded Slices. Use Slice1.
  //Gradients dont work in browser (at least this library doesnt), so replaced with normal view.
  //<LinearGradient colors={['#1e1e1e', '#3C403F']} style={styles.container}>
  //</LinearGradient>
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollContainer} nestedScrollEnabled={true}>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          data.map(slice => (
            <Slice sliceTitle={slice.title} items={slice.sliceItems} navigation={navigation} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function Player({navigation, route}) : JSX.Element {
  const video = React.useRef(null);
  const [status, setStatus] = useState({});
  const onPress = () =>{
    navigation.navigate('Brand', {websafeTitle: route.params})
  }
  return(
    <View style={styles.container}>
      <Button color={'#00E2C4'} onPress={onPress}></Button>
      <Video
        ref={video}
        style={styles.video}
        source={{
          uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        }}
        useNativeControls
        isLooping
        resizeMode="stretch"
        shouldPlay
        onLoadStart={() => video?.current?.presentFullscreenPlayer()}
        onPlaybackStatusUpdate={status => setStatus(() => status)}
      />

    </View>
  )
}

function Brand({navigation, route}) : JSX.Element {
  const [brand, setBrand] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const {id, websafeTitle} = route.params;
  const getBrand = async() =>{
    try {
      const response = await fetch(`https://cors-anywhere.herokuapp.com/https://www.channel4.com/programmes/${websafeTitle}?json=true`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        },
      });
      const json = await response.json();
      setBrand(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getBrand();
  }, []);
  
  const onPress = () =>{
    navigation.navigate('Home');
  }

  return(
    <View>
      {isLoading ? (<ActivityIndicator/>) : (
        <View style={styles.container}>
          <Button color={'#00E2C4'} onPress={onPress}></Button>
          <BrandHeader image={brand.brandData.brand.images.image16x9.src}
          title={brand.brandData.brand.title}
          summary={brand.brandData.brand.summary}></BrandHeader>

          <ScrollView style={styles.scrollContainer}>
            {brand.brandData.brand.episodes.map(episode => (
            <Episode websafeTitle={websafeTitle} navigation={navigation} image={episode.image.src} title={episode.title} description={episode.description} dateLabel={episode.bottomText}></Episode>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

function Episode({navigation, title, image, description, dateLabel, websafeTitle}) : JSX.Element{
  
  const [focus, setFocus] = useState(false);

  const onFocus = useCallback(() => {
    setFocus(true);
  }, [title]);

  const onBlur = useCallback(() => {
    setFocus(false);
  }, []);

  const onPress = () => {
    setFocus(true);
    navigation.navigate('Player', {websafeTitle: websafeTitle});
  };

  return(
    <TouchableHighlight onPressIn={onPress} onPressOut={onBlur} style={[styles.episodeContainer, focus ? styles.episodeContainerFocus : null]}>
      <View style={{flexDirection: 'row'}}>
        <Image style={styles.episodeImage} source={{uri: image}}></Image>
        <View style={styles.episodeText}>
          <Text style={styles.episodeHeader}>{title}</Text>
          <Text style={styles.episodeOtherText}>{description}</Text>
          <Text style={styles.episodeOtherText}>{dateLabel}</Text>
        </View>
      </View>
    </TouchableHighlight>
  )
}

function BrandHeader({image, title, summary}) : JSX.Element {
  return(
    <View style={styles.brandHeader}>
      <Image style={styles.brandHeaderImage} source={{uri: image}}></Image>
      <Text style={styles.brandHeaderText}>{title}</Text>
      <Text style={styles.summary}>{summary}</Text>
    </View>
  )
}

const Stack = createNativeStackNavigator();

function App() : JSX.Element {
  return(
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={Home}></Stack.Screen>
        <Stack.Screen name="Player" component={Player}></Stack.Screen>
        <Stack.Screen name="Brand" component={Brand}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

//StyleSheet styles for all components.
const styles = StyleSheet.create({
  back: {
    backgroundColor: '#00E2C4',
  },
  wrapper: {
    borderColor: 'transparent',
    borderWidth: 5,
    borderRadius: 15,
    marginVertical: 10,
  },
  wrapperFocused: {
    borderColor: '#00E2C4',
  },
  image: {
    width: 250,
    height: 150,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  text: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tileContainer: {
    flexDirection: 'column',
  },
  header: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: '4%',
  },
  headerText: {
    fontSize: 55,
    color: 'white',
    marginTop: '5%',
  },
  logo: {
    width: 150,
    height: 150,
    marginTop: '1%',
    marginLeft: '1%',
    position: 'absolute',
    left: 3,
    top: 3,
    resizeMode: 'contain',
  },
  scrollView: {
    marginTop: 5,
    alignContent: 'space-between',
    marginBottom: 15,
    height: 'auto',
    width: '100%',
    position: 'relative',
    flexDirection: 'row',
    alignSelf: 'center',
  },
  summary: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
  },
  sliceTitle: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 25,
    position: 'relative',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: '#1e1e1e',
  },
  scrollContainer: {
    flex: 2,
    flexDirection: 'column',
    marginLeft: 40,
    marginRight: 40,
  },
  video: {
    width: 1500,
    height: 1500,
    position: 'absolute',
  },
  brandHeader: {
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 100,
    marginRight: 100,
  },
  brandHeaderImage: {
    position: 'relative',
    width: '100%',
    height: 500,
    resizeMode: 'contain',
    marginBottom: 0,
  },
  brandHeaderText: {
    marginTop: 400,
    position: 'absolute',
    textAlign: 'center',
    fontSize: 55,
    color: 'white',
  },
  episodeContainerFocus: {
    flexDirection: 'row',
    borderColor: '#00E2C4',
  },
  episodeContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    backgroundColor: '#3C403F',
    borderColor: 'transparent',
    borderWidth: 5,
    borderRadius: 15,
    marginVertical: 10,
    marginHorizontal: 200,  
  },
  episodeImage: {
    position: 'relative',
    width: 350,
    height: 150,
    resizeMode: 'contain',
  },
  episodeText: {
    alignSelf: 'center',
  },
  episodeHeader: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  episodeOtherText:{
    color: 'white',
    fontSize: 16,
  }
});

export default App;
