import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';

const doel = document.getElementById('app');
doel.innerHTML = '';
mount(App, { target: doel });
