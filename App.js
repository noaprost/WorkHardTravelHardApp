import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { theme } from './colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; 
import { Octicons } from '@expo/vector-icons'; 

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [done, setDone] = useState(false);
  const [editingText, setEditingText] = useState(text);
  const [editingKey, setEditingKey] = useState();

  const isEdit = editingKey !== undefined;

  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payLoad) => setText(payLoad);
  const onChangeEditText = (payLoad) => setEditingText(payLoad);
  const saveToDos = async (toSave) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  }
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);

    if (s !== null) {
      setToDos(JSON.parse(s));
    }
  };

  useEffect(() => {
    loadToDos();
  }, [working]);

  const addToDo = async () => {
    if(text === ""){
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()] : {text, working, done}
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      {text: "Cancle"},
      {text: "I'm Sure", onPress: async () => {
        const newToDos = {...toDos};
        delete newToDos[key];
        setToDos(newToDos);
        await saveToDos(newToDos);
      }},
    ]);
  };
  const doneToDo = async (key) => {
    const newToDos = {...toDos};
    setDone(!newToDos[key]['done']);
    newToDos[key]['done'] = !newToDos[key]['done'];
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  const finishEdit = () => {
    setEditingKey()
    setEditingText("")
  }

  const editToDo = () => {
    if(editingText === ""){
      return;
    }

    const newToDos = {...toDos};
    newToDos[editingKey]['text'] = editingText;
    
    finishEdit();

    setToDos(newToDos);
    saveToDos(newToDos);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{...styles.btnText, color: working ? theme.white : theme.gray}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{...styles.btnText, color: !working ? theme.white : theme.gray}}>Travel</Text>
        </TouchableOpacity>
      </View>
      {/*<View>
        <Button onPress={() => AsyncStorage.clear() }>clear</Button>
      </View>*/}
      <TextInput
        text="text"
        value={text}
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        placeholderTextColor={theme.gray}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"} 
        style={styles.input} 
      />
      {isEdit ? 
        <TextInput 
          editingText="editingText"
          value={editingText}
          onSubmitEditing={editToDo}
          onChangeText={onChangeEditText}
          returnKeyType="done"
          style={styles.editText}
          /> :
        <ScrollView>
        {Object.keys(toDos).map(key => 
          toDos[key].working === working ?
          (<View style={styles.toDo} key={key}>
            <Text style={!toDos[key].done ? styles.toDoText : styles.doneTextStyle}>{toDos[key].text}</Text>
            <View style={styles.icons}>
              <TouchableOpacity onPress={() => setEditingKey(key)}>
                <Text>
                  <Octicons name="pencil" size={23} color={theme.bg} />
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => doneToDo(key)}>
                <Text>
                  <Ionicons name="checkmark-sharp" size={23} color={toDos[key].done ? theme.white : theme.bg} />
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Text>
                  <Ionicons name="trash-outline" size={23} color={theme.bg} />
                </Text>
              </TouchableOpacity>
            </View>
          </View>)
          : null
        )}
        </ScrollView>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,

  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: theme.white,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.gray,
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toDoText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: "500",
  },
  editText: {
    backgroundColor: theme.gray,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    fontSize: 16,
    color: theme.white,
    fontWeight: "500",
  },
  icons: {
    flexDirection: "row",
    width: "35%",
    justifyContent: "space-evenly",
  },
  doneTextStyle: {
    color: theme.done,
    textDecorationLine: "line-through",
    fontSize: 16,
    fontWeight: "500",
  },
});