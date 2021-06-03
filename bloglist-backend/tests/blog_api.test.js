const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')

const Blog = require('../models/blog')


const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})

    let blogObject = new Blog(helper.initialBlogs[0])
    await blogObject.save()

    blogObject = new Blog(helper.initialBlogs[1])
    await blogObject.save()
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('blog has property id', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
})

test('a valid blog can be added ', async () => {
    const newBlog = {
        title: 'Learning React',
        author: 'University of Helsinki',
        url: 'https://fullstackopen.com',
        likes: 10
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map(n => n.author)
    expect(contents).toContain(
        'University of Helsinki'
    )
})

test('if likes undefined, set to 0', async () => {
    const newBlog = {
        title: 'Learning Node.js',
        author: 'University of Helsinki',
        url: 'https://fullstackopen.com',
    }

    const checkBlog = {
        title: 'Learning Node.js',
        author: 'University of Helsinki',
        url: 'https://fullstackopen.com',
        likes: 0
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const result = response.body[response.body.length - 1]
    expect(result.likes).toEqual(checkBlog.likes)
})

test('if title or url empty', async () => {
    const newBlog = {
        title: 'Learning Express',
        author: 'University of Helsinki',
        likes: 10
    }

    await await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
})

afterAll(() => {
    mongoose.connection.close()
})
