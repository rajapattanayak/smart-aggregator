const ipfs = window.IpfsApi({
    host: 'ipfs.infura.io', 
    port: 5001, 
    protocol: 'https'
})

export default ipfs;