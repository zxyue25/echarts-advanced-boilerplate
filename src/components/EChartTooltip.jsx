import { Button, Tag, Form, Input } from 'antd';
import { useEffect } from 'react';
import { useState } from 'react';
const EChartTooltip = ({ data, isPrize, changeIsPrize }) => {
    const [isAdd, setIsAdd] = useState(false)
    console.log(data)
    useEffect(() => {
        if (isPrize) {
            setIsAdd(true)
        }
    }, [isPrize])

    return <div style={{ color: data.color, fontWeight: 600 }}>
        {
            !isAdd ? <div className={{ width: '130px' }}>
                <Tag color={data.color}>{data.seriesName}</Tag>
                <div style={{ paddingBottom: '4px' }}>
                    {data.name}: {isPrize ? 100 : data.data.value}
                </div>
                <Button onClick={() => { setIsAdd(true); changeIsPrize(true) }}>Add Button</Button>
            </div>
                : <div className={{ width: '200px' }}>
                    <div style={{ color: 'black', paddingBottom: '10px', fontSize: 18 }}>Add</div>
                    <Tag color={data.color}>{isPrize ? 'Email' : data.seriesName}</Tag>
                    <div style={{ paddingBottom: '4px' }}>
                        {isPrize ? 'Wed' : data.name}: {isPrize ? 100 : data.data}
                    </div>
                    <Form
                        name="basic"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        initialValues={{ remember: true }}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="Content"
                            name="content"
                            rules={[{ required: true, message: 'Please input content!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button onClick={() => { setIsAdd(false); changeIsPrize(false) }}>
                                Submit
                            </Button>
                        </Form.Item>
                    </Form></div>
        }

    </div>
}

export default EChartTooltip