import { Helmet } from 'react-helmet'

const MetaData = ({ title }) => {
    const brand = 'Yokan Vault'
    return (
        <Helmet>
            <title>{title && title !== brand ? `${title} - ${brand}` : brand}</title>
        </Helmet>
    )
}

export default MetaData